# TrashFrame

Turn any **Spotify album** into a **printable poster** — multiple layout presets, CSS theming, high-res PNG/PDF export, and album-art–driven background effects.

**Live repo:** [github.com/Somchandra17/TrashFrame](https://github.com/Somchandra17/TrashFrame)

## Features

- **Spotify Web API** — Paste an album link; tracks, durations, cover art, and URI load via client-credentials flow (proxied through Next.js API routes).
- **9 poster layouts** — Classic, Gallery, Overlay, Editorial, Bold Block, Minimal, Receipt, Immersive, Retro — tuned for print-ready hierarchy and spacing.
- **CSS variable theming** — All poster styling lives under `#poster-root` (`--fp-*` variables). Presets or your own uploaded CSS.
- **Style from an Image** — Copy a built-in AI prompt, paste it (with a reference poster) into ChatGPT or Claude, upload the generated CSS.
- **Design controls** — Font scale, color vs B&W cover, gradient background from palette, ghost watermark, QR vs Spotify scannable code.
- **Background layers** — Blurred album bloom, dominant-color overlay & vignette (ColorThief), optional ghost watermark; export-friendly DOM layers.
- **Export** — PNG and PDF at **300 DPI** for chosen frame sizes (4×6, 5×7, A5, A4, 30×40 cm).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Spotify API credentials

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. In TrashFrame, open **API Credentials** and save **Client ID** and **Client Secret** (stored in `localStorage` in your browser only).

## Project structure (high level)

| Path | Role |
|------|------|
| `app/page.js` | Main flow, theme injection, palette / auto-colors, overrides |
| `app/components/Poster.jsx` | Layout switcher + background layers + QR / Spotify code |
| `app/components/Sidebar.jsx` | Frame size, quote, presets, “Style from an Image” |
| `app/posterTheme.css` | Base `--fp-*` defaults + layout-specific rules |
| `app/lib/constants.js` | Presets, downloadable template, AI prompt |
| `app/lib/colors.js` | ColorThief palette + luminance-based auto colors |
| `app/lib/export.js` | PNG / PDF export |
| `app/api/spotify/*` | Token + album proxy routes |

## Build & deploy

```bash
npm run build
npm start
```

Deploy anywhere that supports Next.js 14 (e.g. Vercel). Ensure album cover host `i.scdn.co` remains allowed in `next.config.mjs` `images.remotePatterns` if you use `next/image` elsewhere.

## Tech stack

- Next.js 14 (App Router)
- React
- Tailwind CSS (app UI only; poster is isolated CSS)
- ColorThief, react-qr-code, html-to-image, jsPDF

## License

MIT (or as specified in repository root if different).
