# FirstDay update notices

FirstDay Display Pro and Display Lite read `latest.json` from this repository once a day:
`https://raw.githubusercontent.com/goku2k/FirstDayStudio-updates/main/latest.json`

When the `version` for an edition is newer than the copy a church is running, its control screen shows an
"Update X.Y.Z" button that opens `url`, with `notes` as the tooltip.

- `pro` is FirstDay Display Pro; `studio` is the same entry under its earlier name, kept for copies from before the
  rename (2.8.0 and older). The Update feed workflow keeps both the same. `lite` is Display Lite.
- `version` must look like `2.5.1`. `url` must start with `https://`. Notes are cut at 300 characters.
- Update it only after the release's installer is on firstdaystudio.app/downloads, so the button never points at an
  older file. This now happens by itself (below); edit it by hand only for something unusual.
- This repository must stay **public**: the apps read it without signing in.

## Automatic publishing
New installers reach the website, and this feed, without anyone uploading files:

1. A release workflow in FirstDayDisplayPro (Display Pro, Slides), FirstDayStudioLite or FirstDaySites (Sermon Uploader)
   publishes its GitHub release, then calls `.github/workflows/publish-to-site.yml` here. That job downloads the
   release's installer (checked against GitHub's SHA-256), and `tools/publish-to-site.mjs` sends it to
   firstdaystudio.app in signed 4 MB pieces. The site's FirstDay Downloads plugin checks the size, SHA-256 and file
   type, keeps a copy in `/downloads/versions/`, swaps it in as `/downloads/<Name>.<ext>` and lists it in
   `/downloads/manifest.json`.
2. The **Update feed** workflow (`.github/workflows/sync-feed.yml`, every 30 minutes and by hand) runs
   `tools/sync-feed.mjs`: when the manifest shows a newer Display Pro or Display Lite, it downloads that file from the
   site, checks it matches, and only then commits the new `version` and `notes` here. It never moves backwards and
   never changes `url`.

Setup: Settings > FirstDay Downloads on the website makes the publishing key. Its private half goes into the
repository secret `SITE_PUBLISH_KEY` of FirstDayDisplayPro, FirstDayStudioLite and FirstDaySites; the website keeps only
the public half. Without the secret, release workflows just print a notice.

Callers use `publish-to-site.yml@main`, so a change here changes every app's publishing: review it like release code.

