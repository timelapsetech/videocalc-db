# Video File Size Calculator

A professional-grade static video file size calculator for the media industry, built with React, TypeScript, Vite, and repo-backed JSON data.

## Features

- **Professional Codec Database**: Comprehensive support for industry-standard codecs including ProRes, DNxHD, RAW formats, and broadcast standards
- **Repo-backed codec data**: Codec catalog and default presets ship as JSON (`data/codecs.json`, `data/default-presets.json`) and are updated via pull requests
- **Real-time Calculations**: Automatic file size calculations as you adjust parameters - no calculate button needed
- **Frame Rate Accuracy**: Precise calculations supporting all professional frame rates from 23.98 to 240 fps
- **Workflow Presets**: Quick-start configurations for common workflows like YouTube delivery, Netflix specs, and broadcast standards
- **Shareable Links**: Generate shareable URLs for specific calculations to collaborate with team members
- **Static Deployment**: No hosted admin UI, database, or custom stats backend required
- **Optional Google Analytics**: Configurable GA tracking that only runs after cookie consent
- **Mobile Responsive**: Optimized for all device sizes with touch-friendly interface

## Repository structure

```text
data/
  codecs.json              Static codec catalog bundled into the app
  default-presets.json     Static default workflow presets
src/
  components/              React UI components
  context/                 React providers for codec and preset state
  data/                    Static data loaders and resolution/frame-rate definitions
  hooks/                   Page tracking hooks
  types/                   TypeScript data contracts
  utils/                   Analytics, privacy, URL sharing, and helpers
.github/workflows/
  deploy.yml               GitHub Pages build and deployment workflow
```

The app does not read from Firebase, Firestore, Cloudflare D1, or any other database at runtime. Codec and default preset data are imported from JSON during the Vite build.

## Environment variables

Build-time (Vite) variables:

```
# Optional: Google Analytics (when users consent)
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
```

## Updating codec data

Edit [`data/codecs.json`](data/codecs.json) and [`data/default-presets.json`](data/default-presets.json), then open a pull request. The app bundles these files at build time.

Codec entries can include source and accuracy metadata:

- `accuracy: "spec"` means the bitrate is tied to a published manufacturer, standards, or formula-derived target rate.
- `accuracy: "estimate"` means the bitrate is a practical estimate for a variable, content-dependent, or recommendation-based codec.
- `sourceUrls` should point to reputable references such as manufacturer docs, standards bodies, platform upload guidance, or published white papers.
- `notes` should explain assumptions, unsupported combinations removed, or cases where rates vary by camera, sensor mode, encoder, or image content.

When contributing codec changes, please include sources in the JSON and describe the reasoning in the pull request.

## Contributing

Contributions are welcome, especially corrections to codec data, additional source references, accessibility improvements, and UI fixes.

Before opening a pull request:

1. Run `npm install` if dependencies are not installed.
2. Make focused changes.
3. Run `npm run build`.
4. Run `npm run lint`.
5. For codec data changes, include reputable source URLs and explain whether values are exact specs or estimates.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for more detailed guidance.

## Deployment

This repository deploys the static Vite build to GitHub Pages using GitHub Actions.

- Workflow: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
- Trigger: push to `main` or manual `workflow_dispatch`
- Build output: `dist`
- Routing: `npm run build` copies `dist/index.html` to `dist/404.html` so direct links work with React Router on GitHub Pages

In repository settings, configure **Pages** to use **GitHub Actions** as the source. The workflow sets `BASE_PATH` to `/${{ github.event.repository.name }}/` so assets and routes work when hosted as a project page.

Optional production analytics can be enabled by adding a repository secret named `VITE_GA_MEASUREMENT_ID`.

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

This is the first public-facing release of the Video File Size Calculator, featuring static codec data, full GDPR compliance, and clear privacy controls for all users.

![Release](https://img.shields.io/badge/release-0.9.1-blue)
