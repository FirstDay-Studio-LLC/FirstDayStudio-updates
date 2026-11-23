#!/usr/bin/env node
// Moves latest.json forward when firstdaystudio.app serves a newer Display Pro or Display Lite installer.
// The site's FirstDay Downloads plugin lists what it serves in /downloads/manifest.json. This script downloads the
// listed file and checks its size and SHA-256 before changing the feed, so the "Update X.Y.Z" button never appears
// before the installer is really there. It never moves the feed backwards and never changes `url`.
// Usage: node tools/sync-feed.mjs [--site https://firstdaystudio.app] [--feed latest.json]
// Prints "changed" or "unchanged" on its last line; exits 1 on a problem.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

// latest.json key -> app in the site's manifest. Display Pro is "pro"; "studio" is the same entry under its earlier name,
// kept for copies from before the rename (2.8.0 and older read it).
const FEED = { pro: 'pro', studio: 'pro', lite: 'lite' };
const MAX = 800 * 1024 * 1024;

const opt = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => (i % 2 ? a : [...a, [v.replace(/^--/, ''), all[i + 1]]]), []));
const site = new URL(opt.site || 'https://firstdaystudio.app');
const feedPath = opt.feed || 'latest.json';
if (site.protocol !== 'https:' && process.env.FDD_ALLOW_HTTP !== '1') throw new Error('--site must be https://');

const semver = (v) => /^\d+\.\d+\.\d+$/.test(String(v || ''));
const newer = (a, b) => {
  const x = a.split('.').map(Number), y = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
};

async function get(path) {
  const u = new URL(path, site);
  u.searchParams.set('nocache', String(Date.now()));
  const r = await fetch(u, { redirect: 'error', headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(600000) });
  if (!r.ok) throw new Error(`${u.pathname}: HTTP ${r.status}`);
  return r;
}

async function main() {
  let manifest;
  try {
    manifest = await (await get('/downloads/manifest.json')).json();
  } catch (e) {
    console.log(`No manifest on the site yet (${e.message}); nothing to do.`);
    console.log('unchanged');
    return;
  }
  const feed = JSON.parse(readFileSync(feedPath, 'utf8'));
  let changed = false;
  const problems = [];

  for (const [key, app] of Object.entries(FEED)) {
    try {
      const info = manifest?.apps?.[app]?.win;
      if (!info) continue;
      const { version, versioned, size, sha256, notes } = info;
      if (!semver(version) || !/^\/downloads\/versions\/[A-Za-z0-9][A-Za-z0-9.-]*\.exe$/.test(versioned || '') ||
          !Number.isSafeInteger(size) || size < 1 || size > MAX || !/^[0-9a-f]{64}$/.test(sha256 || '')) {
        throw new Error(`The site's manifest entry for ${app} looks wrong; not touching the feed.`);
      }
      const cur = feed[key]?.version || '0.0.0';
      if (!newer(version, cur)) { console.log(`${key}: feed ${cur}, site ${version}: nothing to do`); continue; }

      console.log(`${key}: the site serves ${version} (feed has ${cur}); checking ${versioned}`);
      const r = await get(versioned);
      const h = createHash('sha256');
      let n = 0;
      for await (const c of r.body) {
        n += c.length;
        if (n > size) throw new Error(`${versioned} is larger than the manifest says`);
        h.update(c);
      }
      const got = h.digest('hex');
      if (n !== size || got !== sha256) throw new Error(`${versioned} does not match the manifest (size ${n}, SHA-256 ${got}); not touching the feed.`);

      let text = String(notes || '').replace(/\s+/g, ' ').trim();
      if (!text) text = `Version ${version}.`;
      if (text.length > 300) text = text.slice(0, 299).replace(/\s+\S*$/, '') + '…';
      feed[key] = { ...(feed[key] || {}), version, notes: text };
      if (!/^https:\/\//.test(feed[key].url || '')) feed[key].url = 'https://firstdaystudio.app/#download';
      console.log(`${key}: feed -> ${version}`);
      changed = true;
    } catch (e) {
      problems.push(e.message); // the other edition can still move forward
    }
  }

  if (changed) writeFileSync(feedPath, JSON.stringify(feed, null, 2) + '\n');
  for (const p of problems) console.error(`::error::${p}`);
  console.log(changed ? 'changed' : 'unchanged');
  if (problems.length) process.exitCode = 1;
}

main().catch((e) => { console.error(`::error::${e.message}`); process.exit(1); });
