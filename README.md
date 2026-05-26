# Video File Size Calculator

A professional-grade static video and audio file size calculator for the media industry, built with React, TypeScript, Vite, and repo-backed JSON data. Supported calculations also show a ready-to-edit single-pass FFmpeg command for creating the selected video/audio combination.

## Features

- **Professional Codec Database**: Comprehensive support for industry-standard codecs including ProRes, DNxHD, RAW formats, and broadcast standards
- **Repo-backed codec data**: Codec catalog, audio configurations, and default presets ship as JSON (`data/codecs.json`, `data/audio-configurations.json`, `data/default-presets.json`) and are updated via pull requests
- **Real-time Calculations**: Automatic file size calculations as you adjust parameters - no calculate button needed
- **Optional Audio Calculations**: Add valid source-backed audio configurations to the total bitrate when audio should be included in storage estimates
- **FFmpeg Command Output**: Supported configurations include a single-pass FFmpeg command with video, audio, muxer, and output-extension settings; unsupported exact variants explain why no FFmpeg command is shown
- **Frame Rate Accuracy**: Precise calculations supporting all professional frame rates from 23.98 to 240 fps
- **Workflow Presets**: Quick-start configurations for common workflows like YouTube delivery, Netflix specs, and broadcast standards
- **Shareable Links**: Generate shareable URLs for specific calculations to collaborate with team members
- **Static Deployment**: No hosted admin UI, database, or custom stats backend required
- **Optional Google Analytics**: Configurable GA tracking that only runs after cookie consent
- **Mobile Responsive**: Optimized for all device sizes with touch-friendly interface

## Repository structure

```text
data/
  audio-configurations.json Static audio profile catalog keyed by codec and variant
  codecs.json              Static codec catalog bundled into the app
  default-presets.json     Static default workflow presets
src/
  components/              React UI components
  context/                 React providers for codec and preset state
  data/                    Static data loaders and resolution/frame-rate definitions
  hooks/                   Page tracking hooks
  types/                   TypeScript data contracts
  utils/                   Analytics, privacy, URL sharing, audio, FFmpeg, and helpers
.github/workflows/
  deploy.yml               GitHub Pages build and deployment workflow
```

The app does not read from Firebase, Firestore, Cloudflare D1, or any other database at runtime. Codec and default preset data are imported from JSON during the Vite build.

## Environment variables

Build-time (Vite) variables:

```
# Optional: Google Analytics measurement ID
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Local development

Create a `.env` file if you need Google Analytics during development.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Validate generated FFmpeg command variants
npm run validate:ffmpeg -- --input samples/HD_INPUT.mp4
```

## Updating codec data

Edit [`data/codecs.json`](data/codecs.json), [`data/audio-configurations.json`](data/audio-configurations.json), and [`data/default-presets.json`](data/default-presets.json), then open a pull request. The app bundles these files at build time.

Codec entries can include source and accuracy metadata:

- `accuracy: "spec"` means the bitrate is tied to a published manufacturer, standards, or formula-derived target rate.
- `accuracy: "estimate"` means the bitrate is a practical estimate for a variable, content-dependent, or recommendation-based codec.
- `sourceUrls` should point to reputable references such as manufacturer docs, standards bodies, platform upload guidance, or published white papers.
- `notes` should explain assumptions, unsupported combinations removed, or cases where rates vary by camera, sensor mode, encoder, or image content.

When contributing codec changes, please include sources in the JSON and describe the reasoning in the pull request.

Audio entries in [`data/audio-configurations.json`](data/audio-configurations.json) are keyed by codec ID, with variant-specific overrides in the form `codecId::Variant Name`. PCM audio rates are calculated from `sampleRateHz * bitDepth * channels`, while compressed delivery profiles use explicit `bitrateKbps` recommendations. Use `accuracy: "spec"` for manufacturer or standards-backed constraints, and `accuracy: "estimate"` for platform recommendations or container-governed workflows.

FFmpeg commands are generated from the resolved video codec/variant plus the selected audio profile. Recipes live in [`src/utils/ffmpegCommand.ts`](src/utils/ffmpegCommand.ts) and are intentionally conservative: if FFmpeg cannot author the exact camera-original, RAW, package-level, or vendor-specific output, the app shows an unsupported message instead of an approximate command.

## Validating FFmpeg command support

Use [`scripts/validate_ffmpeg_commands.py`](scripts/validate_ffmpeg_commands.py) to re-run the FFmpeg command matrix whenever codec or audio data changes.

```bash
# Full validation matrix using the bundled sample
npm run validate:ffmpeg -- --input samples/HD_INPUT.mp4

# Faster focused checks while developing
npm run validate:ffmpeg -- --audio-mode default --match h264 --duration 0.5
```

The validator reads the current codec and audio JSON, enumerates supported command combinations, runs FFmpeg, probes each output with `ffprobe`, and writes Markdown/JSON reports to `.ffmpeg-validation/`. If the input has no audio stream, it creates a temporary silent-audio input so audio command variants can still be tested. Generated validation outputs are ignored by git.

Rendered media files are scratch data: the script cleans `.ffmpeg-validation/outputs/` at the start of each real run, deletes successful outputs after probing, and deletes failed partial outputs by default to avoid filling the disk during large batches. Use `--keep-outputs`, `--keep-failed-outputs`, or `--keep-existing-outputs` only when you need files for manual inspection.

## Contributing

Contributions are welcome, especially corrections to codec data, audio profiles, FFmpeg command recipes, additional source references, accessibility improvements, and UI fixes.

Before opening a pull request:

1. Run `npm install` if dependencies are not installed.
2. Make focused changes.
3. Run `npm run build`.
4. Run `npm run lint`.
5. For codec, audio, or FFmpeg recipe changes, include reputable source URLs and explain whether values are exact specs, estimates, or intentionally unsupported.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for more detailed guidance.

## Deployment

This repository deploys the static Vite build to GitHub Pages using GitHub Actions.

- Workflow: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
- Trigger: push to `main` or manual `workflow_dispatch`
- Build output: `dist`
- Routing: `npm run build` copies `dist/index.html` to `dist/404.html` so direct links work with React Router on GitHub Pages

In repository settings, configure **Pages** to use **GitHub Actions** as the source. This repo includes `public/CNAME` for the `videocalc.org` custom domain, so the workflow builds with `BASE_PATH=/` and publishes assets from the domain root. If you remove the custom domain and host at `https://<user>.github.io/videocalc-db/`, change the workflow `BASE_PATH` to `/videocalc-db/`.

Optional production analytics can be enabled by adding a repository secret named `VITE_GA_MEASUREMENT_ID`. When present, the build adds the Google tag to the initial HTML with Consent Mode defaulting analytics storage to denied; page views and events are sent only after the visitor accepts analytics cookies.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router
- **Build Tool**: Vite
- **Deployment**: Github Pages
- **Analytics**: Google Analytics (configurable)

## License

This project is supported by [mediasupplychain.org](https://mediasupplychain.org) and is free for all professionals in the media industry.

## Version

Current release: **0.9.1** (July 2025)

This public-facing release features static codec data, source-backed audio configurations, single-pass FFmpeg command output for supported exact variants, full GDPR compliance, and clear privacy controls for all users.

![Release](https://img.shields.io/badge/release-0.9.1-blue)
