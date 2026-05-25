# Contributing

Thanks for helping improve the Video File Size Calculator. This project is a static React app, so most contributions fall into three areas: improving the calculator UI, improving static codec/audio data, or improving FFmpeg command support.

## How The App Works

- The app is built with React, TypeScript, Tailwind CSS, and Vite.
- Codec data lives in `data/codecs.json`.
- Audio profile data lives in `data/audio-configurations.json`.
- FFmpeg command recipes live in `src/utils/ffmpegCommand.ts`.
- Default workflow presets live in `data/default-presets.json`.
- The app imports those JSON files at build time through the `@repo-data` alias.
- There is no runtime database, admin panel, stats backend, Firebase, Firestore, or Cloudflare D1 dependency.

## Local Development

```bash
npm install
npm run dev
```

Before opening a pull request, run:

```bash
npm run build
npm run lint
```

`npm run lint` may report existing warnings, but it should not report errors.

## Codec Data Contributions

Codec and audio data should be practical, sourced, and clear about uncertainty.

Use `accuracy: "spec"` when the value comes from a published manufacturer spec, standards document, official data-rate table, or a direct formula such as uncompressed video bitrate.

Use `accuracy: "estimate"` when the value is a recommendation or content-dependent estimate, such as delivery codecs, constant-quality codecs, RAW compression ratios, FFV1, or settings that vary by camera model and encoder.

For codec changes:

- Include reputable `sourceUrls`.
- Explain assumptions in `notes`.
- Remove unsupported resolution/frame-rate combinations instead of filling them with placeholder values.
- Keep preset references valid after renaming codecs or variants.
- Prefer preserving stable IDs unless a structural cleanup clearly requires changing them.

For audio changes:

- Add codec-level profiles in `data/audio-configurations.json` unless a variant needs a stricter override.
- Use `codecId::Variant Name` for variant-specific audio assignments.
- For PCM, include sample rate, bit depth, and channel count so the app can calculate bitrate.
- For compressed audio, include explicit `bitrateKbps` values and source whether they are specs or platform recommendations.

For FFmpeg command changes:

- Keep recipes exact. If FFmpeg cannot author the true file type or vendor-specific camera package, return an unsupported reason instead of an approximation.
- Prefer single-pass commands with one `INPUT_FILE` and one `OUTPUT_FILE.ext` placeholder.
- Include both video and audio muxer constraints when adding support for a new container.
- Validate representative commands locally with FFmpeg before opening the pull request.

Good sources include manufacturer documentation, standards bodies, official platform upload guidance, codec white papers, and vendor data-rate calculators.

## Pull Request Guidance

Please keep pull requests focused. A codec-data correction, UI change, or documentation update is easier to review when it is not mixed with unrelated cleanup.

For data changes, include a short summary of:

- Which codecs or variants changed.
- Whether the rates are exact specs or estimates.
- Whether audio profiles or FFmpeg command recipes changed.
- Which source documents support the change.
- Any presets that needed updating.

## Deployment

Deployments are handled by GitHub Actions in `.github/workflows/deploy.yml`. Merges to `main` build the Vite app and publish `dist` to GitHub Pages.
