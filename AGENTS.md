# Agent guide — Video File Size Calculator / Spec Library

This document is for **AI coding agents** (and human contributors) working in [`timelapsetech/videocalc-db`](https://github.com/timelapsetech/videocalc-db). Read it before editing data or UI so changes stay compatible with the static build and calculator.

Human-oriented detail also lives in [`README.md`](README.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## What this project is

- **Static React + TypeScript app** (Vite). No runtime database.
- **Calculator** (`/`): file size from codec bitrates in `data/codecs.json`, optional audio from `data/audio-configurations.json`.
- **Spec Library** (`/streaming-services`): partner **ingest** requirements (video/audio/container notes + links to published docs), merged from JSON at build time.
- **Codec database** (`/codec-data`): browse/search the same codec catalog.
- Data is imported via the `@repo-data` alias → `data/` (see `vite.config.ts`).

**Deploy:** push to `main` → GitHub Actions runs `npm run build` (includes `postbuild` static SEO HTML) → GitHub Pages. Do not commit `dist/`.

---

## Commands agents should run

```bash
npm install
npm run build          # required — must pass; runs postbuild static pages
npm run lint           # no new errors
npm run dev            # local UI smoke test
```

When changing **codecs**, **audio**, or **FFmpeg recipes**:

```bash
npm run validate:ffmpeg -- --input samples/HD_INPUT.mp4
# or a focused pass while iterating:
npm run validate:ffmpeg -- --audio-mode default --match h264 --duration 0.5
```

Optional maintenance script (canonicalizes calculator fields on delivery options — read before running):

```bash
node scripts/rationalize_streaming_specs.mjs
```

---

## Repository map

| Path | Role |
|------|------|
| `data/codecs.json` | Codec categories, variants, bitrates by resolution + frame rate |
| `data/audio-configurations.json` | Audio profiles per codec / variant override |
| `data/default-presets.json` | Calculator quick-select presets on home page |
| `data/streaming-services.json` | OTT / streaming app ingest catalog |
| `data/broadcast-cable-parents.json` | US broadcast/cable **parent** companies (shared specs) |
| `data/distributor-platform-services.json` | MVPD, FAST ops, store, distributor ingest |
| `data/streaming-calculator-templates.json` | Shared calculator configs referenced by `calculatorTemplate` |
| `src/data/loadStreamingServices.ts` | Merges the three spec JSON files + resolves templates |
| `src/data/publicCatalogServices.ts` | Filters which services appear on the public Spec Library |
| `src/types/streamingServices.ts` | TypeScript contracts for spec rows |
| `src/utils/calculatorVariants.ts` | Normalizes platform delivery tiers → encoder profiles |
| `src/utils/calculatorAudio.ts` | Partner audio ID aliases → catalog IDs |
| `src/utils/resolveCalculatorSelection.ts` | Applies presets / partner specs to calculator state |
| `src/utils/fileSizeCalculation.ts` | Bitrate + file size math |
| `src/utils/ffmpegCommand.ts` | FFmpeg command recipes (conservative / exact only) |
| `src/components/Seo.tsx` | Client-side meta tags per route |
| `scripts/build_static_pages.mjs` | Postbuild SEO HTML for listed routes (keep in sync with `Seo.tsx`) |

---

## Spec Library — how data is merged

At runtime, `getStreamingServicesCatalog()` in `src/data/loadStreamingServices.ts`:

1. Loads `broadcast-cable-parents.json` and `distributor-platform-services.json` services.
2. Appends `streaming-services.json` services **except** IDs already used by parents/distributors (parents win on ID collision).
3. Resolves each delivery option’s `calculator` from inline object or `calculatorTemplate`.
4. Filters to **public** rows via `filterPublicCatalogServices()` (see below).

**Service `id` rules**

- Use **kebab-case** slugs (`amazon-prime-video`, `ae-networks`).
- IDs must be **unique across all three JSON files**. Duplicate IDs in `streaming-services.json` are silently dropped if the same ID exists in parents or distributors.
- Changing an `id` breaks URLs (`/streaming-services/:serviceId`) and calculator partner preset IDs (`serviceId::optionId`).

---

## Which file to edit

| Content | File |
|---------|------|
| Netflix, YouTube, Disney+, etc. | `data/streaming-services.json` |
| NBCUniversal, Paramount, Fox, A+E, etc. (parent specs) | `data/broadcast-cable-parents.json` |
| Verizon, DirecTV, Plex ingest, Roku, etc. | `data/distributor-platform-services.json` |
| Same calculator settings on many options | `data/streaming-calculator-templates.json` + `calculatorTemplate` on options |
| Bitrates / codec variants | `data/codecs.json` |
| Audio layouts | `data/audio-configurations.json` |
| Home page quick preset chips | `data/default-presets.json` (+ migration in `src/context/PresetContext.tsx` if bundled IDs must update user localStorage) |

Update `metadata.lastUpdated` in the JSON file you touch (ISO date string).

---

## Service row shape (summary)

Required top-level fields (see `src/types/streamingServices.ts`):

- `id`, `name`, `tagline`, `description`, `accessModel`, `revenueModel`, `specUrl`, `websiteUrl`
- `businessModels`: array of allowed slugs (see `src/data/streamingBusinessModels.ts`)
- `deliveryOptions`: non-empty array for public entries

Common optional fields:

- `catalogKind`: `streaming-ott` \| `broadcast-cable-parent` \| `fast-platform`
- `brands`, `distributionKinds`, `relatedServiceIds`, `distributorWorkflowAliases`
- `businessModelNotes`, `specSourceType` (override URL classifier)
- `ingestWorkflow` on options: `linear-cable-program` \| `linear-on-air-mxf` \| `broadcast-commercial` \| `ott-streaming`

**Do not** add `specSourceType: "not-found"` rows expecting them on the public site — they are filtered out.

---

## Delivery option shape (summary)

Each option needs:

- `id` (unique within the service), `name`, `purpose`, `summary`
- `businessModel`, `deliveryTier`
- `videoSpecs`, `audioSpecs`, `containerSpecs` — arrays of `{ "label", "value" }` (human-readable spec text)
- `specUrl` — link to the **published** doc for this workflow
- `ffmpegSupported`: `true` \| `false`; if false, add `ffmpegNotes` explaining why (IMF, XDCAM OP1a, etc.)
- **Calculator:** either `calculatorTemplate: "template-id"` **or** inline `calculator: { ... }` — **one is required** (build throws if both missing)

Prefer **`calculatorTemplate`** when multiple options share the same calculator profile.

---

## Public Spec Library visibility

A service appears on https://videocalc.org/streaming-services only if `isPublicCatalogService()` passes (`src/data/publicCatalogServices.ts`):

- At least one delivery option classifies as **`official`** or **`third-party-guide`** from `specUrl` (via `src/utils/specSource.ts`), unless overridden with `specSourceType` on the option or service.
- Rows with only `partner-portal`, `industry-article`, or `not-found` sources are **hidden**.

When adding a partner:

1. Use a real **published** spec URL (PDF, help center article, developer spec).
2. If the URL is official but not auto-detected, add the host pattern to `OFFICIAL_URL_PATTERNS` in `src/utils/specSource.ts` **or** set `specSourceType: "official"` on the option.
3. Do not invent bitrates — tie calculator overrides to documented numbers.

---

## Calculator config — must match `codecs.json`

Every resolved `calculator` object uses the same shape as `CustomPreset` plus optional `videoBitrateOverrideMbps`:

```json
{
  "category": "delivery",
  "codec": "h264",
  "variant": "High Profile",
  "resolution": "1080p",
  "frameRate": "30",
  "audioEnabled": true,
  "audioProfileId": "mp4-aac",
  "audioConfigurationId": "stereo-384",
  "videoBitrateOverrideMbps": 8
}
```

**Validation rules agents must follow**

| Field | Rule |
|-------|------|
| `category` | Must match `codecs.json` → `categories[].id` (`delivery`, `broadcast`, `professional`, `camera`, `cinema`, `raw`) |
| `codec` | Must match `codecs[].id` in that category |
| `variant` | Must match **`variants[].name` exactly** (case/spacing). Not the platform tier names `SVOD Mezzanine (30 Mbps)` / `AVOD Web Delivery` — those are remapped in `normalizeCalculatorConfig()` to encoder profiles like `High Profile`. |
| `resolution` | Must exist in `src/data/resolutions.ts` (`1080p`, `UHD`, `4K`, …) **and** have a positive bitrate on the variant’s `bitrates` object |
| `frameRate` | Must exist in `resolutions.ts` `frameRates` (`23.98`, `24`, `30`, …) **and** be supported for that resolution on the variant |
| `audioProfileId` / `audioConfigurationId` | Must exist on the codec (or variant override) in `audio-configurations.json`, or use a key in `PARTNER_AUDIO_CONFIGURATION_ALIASES` in `src/utils/calculatorAudio.ts` that maps to a real config |
| `videoBitrateOverrideMbps` | Use when the **platform spec** states a fixed Mbps that differs from the variant table (common for delivery H.264) |

**Broadcast + UHD:** IMF/J2K uses `category: "broadcast"`, `resolution: "UHD"`. The calculator UI must allow UHD for broadcast (see `Calculator.tsx` resolution filters).

After editing templates, run `npm run build` — unknown `calculatorTemplate` IDs throw at catalog load time.

---

## Spec text vs calculator

- **`videoSpecs` / `audioSpecs`**: documentary prose for humans (can mention IMF, loudness, containers).
- **`calculator`**: drives **file size estimate** and “Open in calculator” links — must be technically consistent with the catalog.
- If FFmpeg cannot produce the deliverable (IMF, broadcast MXF chain), set `ffmpegSupported: false` and explain in `ffmpegNotes` / `additionalNotes`.

---

## Home page quick presets

`data/default-presets.json` powers editable quick presets. Bundled Netflix / YouTube presets are **migrated** in `src/context/PresetContext.tsx` when users have old localStorage — if you change bundled preset fields materially, update the migration object there.

Partner specs on the calculator dropdown come from `getStreamingCalculatorPresets()` (`src/utils/streamingCalculatorPresets.ts`) — one entry per delivery option with a resolved calculator; IDs are `serviceId::optionId`.

---

## Codec & audio contributions (short)

- `accuracy: "spec"` vs `"estimate"` — see `CONTRIBUTING.md`.
- Include `sourceUrls` and `notes` in JSON where applicable.
- Remove unsupported resolution/frame-rate combinations; do not use `0` placeholder bitrates.
- PCM bitrates are derived from sample rate × bit depth × channels.
- FFmpeg: only exact commands in `src/utils/ffmpegCommand.ts`; unsupported variants return a clear reason.

---

## UI / code change conventions

- **Minimize scope** — data fixes rarely need React changes.
- Match existing Tailwind patterns and component style.
- Spec Library branding is **“Spec Library”** (route remains `/streaming-services`).
- Tooltips: use `InfoTooltip`, not raw `title` attributes, for acronym pills.
- Do not add runtime databases, admin APIs, or heavy abstractions for one-off helpers.

---

## SEO (when changing titles/descriptions)

Static HTML meta for crawlers is generated in **`scripts/build_static_pages.mjs`** (`postbuild`). In-app navigation uses **`src/components/Seo.tsx`**.

If you change SEO copy for a route (e.g. Spec Library), update **both** files for that `path`. Then run `npm run build` and verify:

```bash
grep '<title>' dist/streaming-services/index.html
```

Per-partner URLs (`/streaming-services/netflix`) do not get separate static HTML; they rely on the SPA + default meta until enhanced.

`sitemap.xml` in `public/` only lists top-level routes — edit manually when adding new **site sections**, not for each partner.

---

## Pull request checklist for agents

1. **Focused diff** — spec-only PRs should not mix unrelated UI refactors.
2. **`npm run build`** passes.
3. **`npm run lint`** — no new errors.
4. Cite **source URLs** in the PR description; quote the spec field you encoded.
5. For calculator changes, confirm the combo works: category + codec + variant + resolution + frame rate + audio exist in catalog.
6. If adding a public partner, confirm the row would pass `isPublicCatalogService()`.
7. For codec/audio/FFmpeg changes, run `npm run validate:ffmpeg` as appropriate.
8. Do not commit secrets, `.env`, or `dist/`.

---

## Common mistakes to avoid

| Mistake | Consequence |
|---------|-------------|
| Duplicate `id` across JSON files | Streaming entry silently omitted from catalog |
| `calculatorTemplate` typo | **Build/runtime throw** on load |
| Variant name mismatch (`High profile` vs `High Profile`) | Calculator preset fails; validation message in UI |
| `resolution` / `frameRate` not in variant bitrates | “Not supported” error; null file size |
| Platform tier as `variant` without override | Wrong bitrate unless `normalizeCalculatorConfig` maps it |
| Only partner-portal URL, no official option | Service **hidden** from Spec Library |
| Editing only `Seo.tsx` or only `build_static_pages.mjs` | Inconsistent SEO between crawlers and SPA |
| Huge unrelated JSON reformat | Hard review, easy merge conflicts |
| Inventing ingest specs without published docs | Violates project intent; row should stay private or unlisted |

---

## Getting help

- Open an issue: https://github.com/timelapsetech/videocalc-db/issues  
- Spec Library page encourages PRs against the three spec JSON files and `streaming-calculator-templates.json`.

When unsure whether a platform spec is public, **search for official partner documentation first**; if none exists, do not add a public catalog row.
