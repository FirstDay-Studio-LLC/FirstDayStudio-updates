# FirstDay update notices

FirstDay Display Pro and Display Lite read `latest.json` from this repository once a day:
`https://raw.githubusercontent.com/goku2k/FirstDayStudio-updates/main/latest.json`

When the `version` for an edition is newer than the copy a church is running, its control screen shows an
"Update X.Y.Z" button that opens `url`, with `notes` as the tooltip.

- `studio` is FirstDay Display Pro (the key keeps its old name so older copies still find it); `lite` is Display Lite.
- `version` must look like `2.5.1`. `url` must start with `https://`. Notes are cut at 300 characters.
- Update it only after the release's installer is on firstdaystudio.app/downloads, so the button never points at an
  older file.
- This repository must stay **public**: the apps read it without signing in.
