#!/usr/bin/env node
// Sends one installer to firstdaystudio.app (the FirstDay Downloads plugin), in signed 4 MB pieces.
// Usage:
//   SITE_PUBLISH_KEY="-----BEGIN PRIVATE KEY-----..." node publish-to-site.mjs \
//     --site https://firstdaystudio.app --app pro --platform win --version 2.8.0 --file dist/X.exe \
//     [--date 2026-11-22] [--notes-file notes.txt] [--tag v2.8.0] [--repo owner/name]
// Exit 0 when the site serves the file (newly published, or it already had exactly this file).
import { createHash, createPrivateKey, createPublicKey, randomBytes, sign } from 'node:crypto';
import { openSync, readSync, closeSync, statSync, readFileSync, createReadStream } from 'node:fs';
import { extname } from 'node:path';

const CHUNK = 4 * 1024 * 1024;
const NS = '/firstday-downloads/v1';

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) throw new Error(`Unexpected argument ${a}`);
    out[a.slice(2)] = argv[++i];
  }
  return out;
}

export function canonical(method, route, time, nonce, upload, offset, body) {
  const h = createHash('sha256').update(body).digest('hex');
  return `FDD1\n${method}\n${route}\n${time}\n${nonce}\n${upload}\n${offset}\n${h}`;
}

export function fingerprint(key) {
  const raw = createPublicKey(key).export({ format: 'der', type: 'spki' }).subarray(-32);
  const h = createHash('sha256').update(raw).digest('hex').slice(0, 16).toUpperCase();
  return h.match(/.{4}/g).join(' ');
}

// Short "what's new" text for the website and the update notice: the release notes without headings,
// list marks, links or the licensing footer, cut at a sentence end before 300 characters.
export function shortNotes(md) {
  let t = String(md || '').split(/\n-{3,}\s*\n/)[0];
  t = t.replace(/^#+ .*$/gm, ' ').replace(/^\s*[-*+]\s+/gm, ' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
       .replace(/[*_`]/g, '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (t.length <= 300) return t;
  const cut = t.slice(0, 300);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  return end > 80 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '') + '…';
}

async function sha256File(path) {
  const h = createHash('sha256');
  for await (const c of createReadStream(path)) h.update(c);
  return h.digest('hex');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const o = args(process.argv.slice(2));
  for (const k of ['site', 'app', 'platform', 'version', 'file']) if (!o[k]) throw new Error(`--${k} is required`);
  const pem = process.env.SITE_PUBLISH_KEY;
  if (!pem || !pem.includes('PRIVATE KEY')) throw new Error('SITE_PUBLISH_KEY is not set (Settings > Secrets and variables > Actions).');
  const key = createPrivateKey(pem);
  if (key.asymmetricKeyType !== 'ed25519') throw new Error('SITE_PUBLISH_KEY is not an Ed25519 key.');
  const site = new URL(o.site);
  if (site.protocol !== 'https:' && process.env.FDD_ALLOW_HTTP !== '1') throw new Error('--site must be https://');
  console.log(`Publishing key fingerprint: ${fingerprint(key)} (Settings > FirstDay Downloads on the site shows the same)`);

  const size = statSync(o.file).size;
  const sha = await sha256File(o.file);
  const ext = extname(o.file).slice(1).toLowerCase();
  const notes = o['notes-file'] ? shortNotes(readFileSync(o['notes-file'], 'utf8')) : '';

  async function call(route, { body = Buffer.alloc(0), upload = '', offset = '', json = false } = {}) {
    const full = `${NS}/${route}`;
    for (let attempt = 1; ; attempt++) {
      const time = String(Math.floor(Date.now() / 1000));
      const nonce = randomBytes(16).toString('hex');
      const sig = sign(null, Buffer.from(canonical('POST', full, time, nonce, upload, offset, body)), key).toString('base64');
      let res, data;
      try {
        res = await fetch(new URL(`${site.pathname.replace(/\/$/, '')}/wp-json${full}`, site), {
          method: 'POST',
          headers: {
            'Content-Type': json ? 'application/json' : 'application/octet-stream',
            'X-FirstDay-Time': time, 'X-FirstDay-Nonce': nonce, 'X-FirstDay-Upload': upload,
            'X-FirstDay-Offset': offset, 'X-FirstDay-Signature': sig,
          },
          body,
          redirect: 'error',
          signal: AbortSignal.timeout(120000),
        });
        const text = await res.text();
        try { data = JSON.parse(text); } catch { data = { message: text.slice(0, 300) }; }
      } catch (e) {
        res = null; data = { message: String(e.message || e) };
      }
      if (res && res.ok) return data;
      const status = res ? res.status : 0;
      // The offset answer says how much the site has; the caller resumes from there.
      if (status === 409 && data?.code === 'fdd_offset') return { resume: data.data?.have };
      const retry = status === 0 || status === 429 || status >= 500;
      if (!retry || attempt >= 4) {
        throw new Error(`${route}: HTTP ${status || 'no answer'}: ${data?.message || ''}`);
      }
      console.log(`  ${route}: HTTP ${status || 'no answer'} (${data?.message || ''}); trying again`);
      await sleep(5000 * attempt);
    }
  }

  const begin = await call('begin', {
    json: true,
    body: Buffer.from(JSON.stringify({
      app: o.app, platform: o.platform, ext, version: o.version, size, sha256: sha,
      date: o.date || new Date().toISOString().slice(0, 10), notes, tag: o.tag || '', repo: o.repo || '',
    })),
  });
  if (begin.status === 'current') {
    console.log(`The site already serves this exact ${o.app} ${o.platform} ${o.version} file. Nothing to do.`);
    return;
  }
  const id = begin.upload;
  const step = Math.min(CHUNK, begin.chunk || CHUNK);
  console.log(`Uploading ${o.file} (${(size / 1048576).toFixed(1)} MB, SHA-256 ${sha}) as upload ${id.slice(0, 8)}…`);

  const fd = openSync(o.file, 'r');
  try {
    let off = 0, lastPct = -1;
    while (off < size) {
      const n = Math.min(step, size - off);
      const buf = Buffer.alloc(n);
      readSync(fd, buf, 0, n, off);
      const r = await call('chunk', { body: buf, upload: id, offset: String(off) });
      if (r.resume !== undefined) {
        const have = Number(r.resume);
        if (!Number.isSafeInteger(have) || have < 0 || have > size) throw new Error('The site answered with a bad offset.');
        console.log(`  the site has ${have} bytes; continuing from there`);
        off = have;
        continue;
      }
      off = r.received;
      const pct = Math.floor((off / size) * 10) * 10;
      if (pct !== lastPct) { console.log(`  ${pct}%`); lastPct = pct; }
    }
  } finally {
    closeSync(fd);
  }
  let fin;
  try {
    fin = await call('finish', { upload: id });
  } catch (e) {
    // The site may have finished but its answer was lost: ask again whether it now serves this file.
    const again = await call('begin', { json: true, body: Buffer.from(JSON.stringify({
      app: o.app, platform: o.platform, ext, version: o.version, size, sha256: sha,
      date: o.date || new Date().toISOString().slice(0, 10), notes, tag: o.tag || '', repo: o.repo || '', check: true })) }).catch(() => null);
    if (again?.status === 'current') { console.log(`Published (confirmed on a second look).`); return; }
    throw e;
  }
  console.log(`Published: ${new URL(fin.file, site)} is now ${fin.version}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(`::error::${e.message}`); process.exit(1); });
}
