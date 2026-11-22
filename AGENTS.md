# Working on the FirstDay update feed (for AI assistants and people)

`latest.json`, read once a day by FirstDay Display Pro and Display Lite to offer an "Update X.Y.Z" button. Owned by the FirstDay-Studio-LLC GitHub organization (moved from the owner's personal account `goku2k`
in Nov 2026); use `FirstDay-Studio-LLC/<repo>` in links.

## Project plans (read first)
- This repository is part of FirstDay Display Pro and Lite. Their plans: `docs/PROJECT-PLAN.md` in `FirstDay-Studio-LLC/FirstDayStudio` and `FirstDay-Studio-LLC/FirstDayStudioLite`. This repository's own notes: [`docs/PROJECT-PLAN.md`](docs/PROJECT-PLAN.md)

Update the plan in the same pull request as the work. If the plan and this file disagree, this file wins.

## How changes reach `main`
1. Start from the latest `main` (`git fetch`, branch from `origin/main`) and check open pull requests and branches first.
2. Work on a branch named `claude/<topic>`, `chatgpt/<topic>` or `codex/<topic>`.
3. Open a pull request into `main` that says what changed and how it was checked.
4. **The owner merges.** Never push to `main`, never force-push it or rewrite its history.
5. No logins, account creation, entering personal data, purchases, destructive actions or contacting anyone on the
   owner's behalf: ask the owner to do those steps (hosting panel, DNS, API keys, email).
6. Never claim something was tested without evidence (command, OS, run link or screenshot, exit code).

## Building, previewing and deploying
- No build step. Check JSON syntax before opening a pull request (for example `python3 -m json.tool latest.json`).
- Churches' copies read `main` directly (`README.md`). **Merging to `main` changes what every installed copy is offered.**

## Runners
This repository is public and has no GitHub Actions workflows. It must never run jobs on the organization's
self-hosted runners. A check, if one is ever added, runs on GitHub-hosted `ubuntu-latest` only.

## Things that are easy to get wrong
- This repository must stay **public** (the apps read it without signing in), so it must **never** be allowed to use the organization's self-hosted runners and must never hold secrets.
- `studio` is FirstDay Display Pro (the key keeps its old name); `lite` is Display Lite. `version` looks like `2.5.1`; `url` starts with `https://`; notes are cut at 300 characters.
- Update it only after the release's installer is on firstdaystudio.app/downloads, and only with the owner's approval.
