# FirstDay update notices

FirstDay Display Pro and Display Lite read `latest.json` from this repository once a day. The repository's address
is now `https://raw.githubusercontent.com/FirstDay-Studio-LLC/FirstDayStudio-updates/main/latest.json`; the apps'
code (2.7.0 and `main` on Nov 22, 2026) still reads the old `goku2k/FirstDayStudio-updates` address, which depends on
GitHub's redirect after the move to the FirstDay-Studio-LLC organization. Changing the apps is planned in their own
repositories.

When the `version` for an edition is newer than the copy a church is running, its control screen shows an
"Update X.Y.Z" button that opens `url`, with `notes` as the tooltip.

- `studio` is FirstDay Display Pro (the key keeps its old name so older copies still find it); `lite` is Display Lite.
- `version` must look like `2.5.1`. `url` must start with `https://`. Notes are cut at 300 characters.
- Update it only after the release's installer is on firstdaystudio.app/downloads, so the button never points at an
  older file.
- This repository must stay **public**: the apps read it without signing in.
