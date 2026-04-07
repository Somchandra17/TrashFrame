# TrashFrame

Turn any **Spotify album or song** into a stunning, **printable poster**. Choose from 15 layout presets, fine-tune album art, tweak typography, and export at configurable DPI for real picture frames.

**Live repo:** [github.com/Somchandra17/TrashFrame](https://github.com/Somchandra17/TrashFrame)
**Live app:** [trash-frame.vercel.app](https://trash-frame.vercel.app/)

---

## Features

### Spotify Integration
- Paste any **Spotify album or song link** (including `spotify.link` short URLs). Tracks, durations, cover art, and URI load instantly via a client-credentials flow proxied through Next.js API routes.

### 15 Poster Layouts
- **Classic** - Clean album poster with big cover, tracklist, and QR code.
- **Gallery** - Drake "More Life" inspired cream/dark panel with palette swatches.
- **Overlay** - Frosted glassmorphism card over a blurred full-bleed cover.
- **Editorial** - Magazine-style with massive title, italic year, labeled metadata columns.
- **Bold Block** - Comic-book poster with colored panel, vertical genre strip, thick grid borders.
- **Immersive** - Full-bleed cover with outlined title and flowing track names over gradient.
- **Retro** - 80s synthwave with neon shadows, skewed titles, and duo-tone art.
- **Cassette J-Card** - Three-panel cassette insert with spine, front cover, and tracklist back.
- **Comic Strip** - Pop-art poster with speech bubbles, price tag, and halftone dots.
- **Retro Playlist** - Vintage polaroid with rotated quote and color swatches.
- **Wave Overlay** - Floating frosted glass text plate over full album art.

- **Receipt** - Stylized supermarket receipt with dashed dividers and dotted track rows.
- **Minimal** - Stripped-down, type-focused layout.
- **Playlist** - Polaroid-style layout with palette swatches.

### Album Art Controls
- **B&W / Color** toggle for the cover art.
- **Custom Frame Art** - Fine-tune how the artwork fits your poster layout to match your physical frame:
  - **Zoom** slider (0.5x-2.0x) - shrink to fit or crop into detail.
  - **Horizontal & Vertical Position** - shift the crop focus point.
  - **Brightness & Contrast** sliders - lighten, darken, or punch up the art.

### Typography & Color
- Independent **Title Scale** and **Tracklist Scale** sliders.
- **Font color** presets (Auto, White, Black, Cream, Gold) + custom color picker.
- **Quote font** selector (Dancing Script, Pacifico, Inter, Space Mono, Playfair Display, Caveat).
- Show/hide toggles for **Timestamp** and **Artist** metadata.

### AI Theme Builder
- Copy a built-in AI prompt, paste it (with a reference poster image) into **ChatGPT**, **Claude**, or **Gemini**, then upload the generated CSS to instantly restyle your poster.

### Export
- **PNG** and **PDF** with configurable DPI (**150** Draft, **300** Print, **600** Ultra).
- Frame sizes: **4x6"**, **5x7"**, **A5**, **A4**, **30x40 cm**.

### Background Effects
- Blurred album bloom, dominant-color overlay & vignette via canvas-based palette extraction.
- Optional ghost watermark layer.
- Solid or gradient background from album palette.
- QR Code or Spotify Scannable Code.

### Quality of Life
- **Fullscreen preview** mode with keyboard shortcut (Escape to exit).
- **Undo/Redo** for all poster overrides (Ctrl+Z / Ctrl+Shift+Z).
- **Recent albums** history (persisted in localStorage, max 6).
- **Responsive** mobile prompt recommending desktop for best experience.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Spotify API Credentials

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Copy your **Client ID** and **Client Secret**.
3. Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```
4. Add your Spotify credentials:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   ```

---

## Project Structure

| Path | Role |
|------|------|
| `app/page.js` | Main flow, theme injection, palette/auto-colors, overrides, undo/redo |
| `app/components/Poster.jsx` | Layout switcher + background layers + QR/Spotify code |
| `app/components/Sidebar.jsx` | Accordion-style edit menu with 7 collapsible sections |
| `app/components/HelpModal.jsx` | Accessible modal explaining custom CSS theming workflow |
| `app/posterTheme.css` | Base `--fp-*` defaults + layout-specific rules for all 15 themes |
| `app/globals.css` | App shell styling + animated landing page |
| `app/lib/constants.js` | Preset themes, frame sizes, downloadable template, AI prompt |
| `app/lib/colors.js` | Canvas-based palette extraction + luminance-based auto colors |
| `app/lib/export.js` | PNG / PDF export with configurable DPI |
| `app/lib/spotify.js` | URL parsing, short-link resolution, data fetching & normalization |
| `app/api/spotify/*` | Album & track data proxy routes + short-link resolver |

---

## Build & Deploy

```bash
npm run build
npm start
```

Deploy anywhere that supports Next.js 14 (e.g. Vercel). Ensure album cover hosts `i.scdn.co` and `scannables.scdn.co` remain allowed in `next.config.mjs` `images.remotePatterns` if you use `next/image` elsewhere.

---

## Tech Stack

- **Next.js 14** (App Router)
- **React**
- **Tailwind CSS** (app UI only; poster is isolated CSS)
- **Canvas API** - palette extraction
- **react-qr-code** - QR code generation
- **html-to-image** - DOM to PNG
- **jsPDF** - PDF generation
- **Framer Motion** - animations & transitions

---

## License

MIT
