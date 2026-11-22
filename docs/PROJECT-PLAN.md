# FirstDay update feed — Shared Project Plan

**Status:** Live feed. `latest.json` offers 2.7.0 for Display Pro (`studio`) and Display Lite (`lite`).
**Audience:** Claude, ChatGPT, Codex, human contributors.
**Owner approval required:** merge pull requests (merging changes what every installed copy is offered), change repository visibility or organization settings.
**Code location:** `FirstDay-Studio-LLC/FirstDayStudio-updates`, branch `main` (`latest.json`, `README.md`). This repository is **public**.
**Last verified:** 2026-11-22 against `main` at `21503f1`.

This is not an app; it is part of FirstDay Display Pro and Display Lite. Their full plans are `docs/PROJECT-PLAN.md` in `FirstDay-Studio-LLC/FirstDayStudio` and `FirstDay-Studio-LLC/FirstDayStudioLite`. This short plan covers only the feed.

## 1. Product objective

Tell churches running Display Pro or Lite that a newer version exists, with a link to the installer, without any sign-in.

## 2. Current verified baseline

- `latest.json`: `studio` 2.7.0 and `lite` 2.7.0, both pointing to `https://firstdaystudio.app/#download`.
- The apps read `https://raw.githubusercontent.com/<owner>/FirstDayStudio-updates/main/latest.json` once a day. The apps' code still uses the **`goku2k`** address (per the FirstDayStudio plan: `UPDATE_URL` in `app/web/announcements.html`); changing it is a code item in that repository's plan. Whether the old raw address keeps redirecting is **not verified** here.
- No workflows. Open pull requests: none. Branches: `main`, `claude/feed-2.7.0` (merged as PR #1).

## 3. Organization, repositories and runners

- This repository belongs to the **FirstDay-Studio-LLC** GitHub organization (moved from the owner's personal account in Nov 2026). Use `FirstDay-Studio-LLC/FirstDayStudio-updates` in links.
- **This repository is public, has no workflows, and must never run jobs on the organization's self-hosted runners.** The organization's runner group must not allow public repositories. Runner names, labels and where each fact comes from are kept in the private repositories' plans (for example `FirstDayStudio`), not here, because this repository is public.
- For reference: the self-hosted runners are **organization runners, not repository runners**. Each one serves every private repository in the organization, so jobs from different repositories wait in line behind each other. Workflows select them by label in `runs-on`. One is a Windows machine (Windows builds and tests, Android builds and emulator tests), the other a Mac (iOS and macOS builds and simulator tests). Source: the runner tables in the private repositories' plans, which cite workflow job records from Nov 21–22, 2026. Whether the runner group really blocks public repositories could not be checked through GitHub (the organization runner API is blocked for Claude): **Not verified**; the owner should check it.
- If a check is ever added here (for example JSON validation), it runs on GitHub-hosted `ubuntu-latest` only.

## 4. Engineering principles and invariants

1. Stays **public** and holds no secrets.
2. `version` like `2.5.1`; `url` starts with `https://`; notes 300 characters at most.
3. Update only after the installer is on firstdaystudio.app/downloads, and only with the owner's approval.
4. `studio` keeps its old key name so older copies still find it.

## 5. Implementation milestones

### M0 — Point the apps at the organization address
- In `FirstDayStudio` and `FirstDayStudioLite`, change `UPDATE_URL` to `FirstDay-Studio-LLC/FirstDayStudio-updates` (tracked in those plans).

**Exit:** a released version of each app reads the feed from the organization address.

### M1 — Each release
- After the 2.8.0 installers are on the website, update both entries in one pull request.

**Exit:** the feed offers the version that is actually downloadable.

## 6. Known gaps and risks

- Installed copies depend on GitHub's redirect from the old `goku2k` raw address until M0 ships and churches update.
- A mistake here reaches every installed copy within a day.

## 7. UX expectations

- Notes are short and plain, for church volunteers (they appear as a tooltip). Follow the wording rules in the Display Pro plan (`FirstDayStudio` `docs/PROJECT-PLAN.md`, section "UX expectations"). No wording rules specific to the feed were found.

## 8. Working agreement for Claude, ChatGPT and other agents

1. **Start from the latest `main`.** `git fetch`, branch from `origin/main`, and check the open pull requests and branches first so you don't duplicate or overwrite someone else's work.
2. **Work on a branch and open a pull request:** `claude/<topic>`, `chatgpt/<topic>` or `codex/<topic>`. The owner merges.
3. **Never push to `main`** (or `drive`), never force-push it, and never rewrite its history. Never push to another agent's branch without being asked.
4. **No logins, account creation, entering personal data, purchases, destructive actions, or contacting anyone on the owner's behalf.** Ask the owner to do those steps (for example hosting-panel logins, API keys, app registrations, DNS changes).
5. **Never claim a build or test passed without evidence:** give the command, the OS, the workflow run link and the exit code, and say whether the artifact exists. Say plainly what was not tested.
6. **Update this plan in the same pull request as the work:** tick finished items, move new facts into "Current verified baseline", and update **Last verified**.
7. Facts and decisions in this plan must come from real sources (the repository, its pull requests, the owner's project notes). Attribute a decision to the owner only if the owner made it. Mark anything untested as **Not verified**.
8. The owner's standing rule for software: check every change for bugs, exploits and vulnerabilities, and fix them, before a build is handed over.

## 9. Immediate next PR recommendation

None in this repository until 2.8.0's installers are on the website. The next related change is **M0** in `FirstDayStudio` and `FirstDayStudioLite`.
