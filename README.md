# Video File Size Calculator

A professional-grade video file size calculator for the media industry, built with React and TypeScript.

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
