# TrashFrame

Turn any **Spotify album** into a stunning, **printable poster** — choose from 15 layout presets, fine-tune album art, tweak typography, and export at 300 DPI for real picture frames.

**Live repo:** [github.com/Somchandra17/TrashFrame](https://github.com/Somchandra17/TrashFrame)

---

## ✨ Features

### 🎵 Spotify Integration
- Paste any **Spotify album link** — tracks, durations, cover art, and URI load instantly via client-credentials flow (proxied through Next.js API routes).

### 🖼 15 Poster Layouts
- **Classic** — Clean album poster with big cover, tracklist, and QR code.
- **Gallery** — Drake "More Life" inspired cream/dark panel with palette swatches.
- **Overlay** — Frosted glassmorphism card over a blurred full-bleed cover.
- **Editorial** — Magazine-style with massive title, italic year, labeled metadata columns.
- **Bold Block** — Comic-book poster with colored panel, vertical genre strip, thick grid borders.
- **Immersive** — Full-bleed cover with outlined title and flowing track names over gradient.
- **Retro** — Crazy 80s synthwave with neon 3D shadows, skewed titles, duo-tone art.
- **Cassette J-Card** — Three-panel cassette insert with spine, front cover, and tracklist back.
- **Comic Strip** — Pop-art poster with speech bubbles, price tag, halftone dots.
- **Retro Playlist** — Vintage polaroid with rotated quote and color swatches.
- **Wave Overlay** — Floating frosted glass text plate over full album art.
- **8-Bit Arcade** — Minimal black & white pixelated cover with scanlines (print-safe).
- **Receipt** — Stylized supermarket receipt with dashed dividers and dotted track rows.
- **Minimal** — Stripped-down, type-focused layout.
- **Playlist** — Polaroid-style with palette swatches.

### 🎨 Album Art Controls
- **B&W / Color** toggle for the cover art.
- **Zoom** slider (0.5x–2.0x) — shrink to fit or crop into detail.
- **Horizontal & Vertical Position** — shift the crop focus point.
- **Brightness & Contrast** sliders — lighten, darken, or punch up the art.

### ✏️ Typography & Color
- Independent **Title Scale** and **Tracklist Scale** sliders.
- **Font color** presets (Auto, White, Black, Cream, Gold) + custom color picker.
- **Quote font** selector (Dancing Script, Pacifico, Inter, Space Mono, Playfair Display, Caveat).
- Show/hide toggles for **Timestamp** and **Artist** metadata.

### 🤖 AI Theme Builder
- Copy a built-in AI prompt, paste it (with a reference poster image) into **ChatGPT** or **Claude**, then upload the generated CSS to instantly restyle your poster.

### 📦 Export
- **PNG** and **PDF** at **300 DPI** for print-ready output.
- Frame sizes: **4×6"**, **5×7"**, **A5**, **A4**, **30×40 cm**.

### 🎭 Background Effects
- Blurred album bloom, dominant-color overlay & vignette (ColorThief).
- Optional ghost watermark layer.
- Solid or gradient background from album palette.
- QR Code or Spotify Scannable Code.

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Spotify API Credentials

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Copy your **Client ID** and **Client Secret**.
3. Create a `.env` file in the project root:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   ```

---

## 📁 Project Structure

| Path | Role |
|------|------|
| `app/page.js` | Main flow, theme injection, palette/auto-colors, overrides |
| `app/components/Poster.jsx` | Layout switcher + background layers + QR/Spotify code |
| `app/components/Sidebar.jsx` | Accordion-style edit menu with 6 collapsible sections |
| `app/posterTheme.css` | Base `--fp-*` defaults + layout-specific rules for all 15 themes |
| `app/globals.css` | App shell styling + animated landing page |
| `app/lib/constants.js` | Preset themes, frame sizes, downloadable template, AI prompt |
| `app/lib/colors.js` | ColorThief palette + luminance-based auto colors |
| `app/lib/export.js` | PNG / PDF export at 300 DPI |
| `app/api/spotify/*` | Album data proxy route |

---

## 🏗 Build & Deploy

```bash
npm run build
npm start
```

Deploy anywhere that supports Next.js 14 (e.g. Vercel). Ensure album cover host `i.scdn.co` remains allowed in `next.config.mjs` `images.remotePatterns` if you use `next/image` elsewhere.

---

## 🛠 Tech Stack

- **Next.js 14** (App Router)
- **React**
- **Tailwind CSS** (app UI only; poster is isolated CSS)
- **ColorThief** — palette extraction
- **react-qr-code** — QR code generation
- **html-to-image** — DOM to PNG
- **jsPDF** — PDF generation

---

## 📄 License

MIT
