export const FRAME_SIZES = {
  "4×6": { label: '4×6"', cm: [10, 15] },
  "5×7": { label: '5×7"', cm: [13, 18] },
  A5:    { label: "A5",    cm: [14.8, 21] },
  A4:    { label: "A4",    cm: [21, 29.7] },
  "30×40": { label: "30×40", cm: [30, 40] },
};

export const DEFAULT_FRAME = "5×7";

export function framePx(key) {
  const { cm } = FRAME_SIZES[key];
  return cm.map((c) => Math.round((c / 2.54) * 300));
}

export function frameAspect(key) {
  const { cm } = FRAME_SIZES[key];
  return cm[0] / cm[1];
}

export const DEFAULT_THEME_CSS = `/* TrashFrame – Poster Theme Variables
 * Edit the values on the right side of each colon.
 * Upload this file in the app to apply your custom theme.
 */

#poster-root {
  --fp-bg: #ffffff;
  --fp-image-filter: grayscale(100%);
  --fp-image-radius: 0px;
  --fp-heading-font: 'Geist', Arial, Helvetica, sans-serif;
  --fp-heading-size: 1.6em;
  --fp-heading-color: #111111;
  --fp-heading-weight: 800;
  --fp-heading-spacing: 0.04em;
  --fp-subtitle-color: #666666;
  --fp-subtitle-size: 0.85em;
  --fp-meta-color: #999999;
  --fp-meta-size: 0.55em;
  --fp-quote-font: 'Dancing Script', cursive;
  --fp-quote-size: 1.3em;
  --fp-quote-color: #333333;
  --fp-quote-style: italic;
  --fp-track-font: 'Geist Mono', 'Courier New', monospace;
  --fp-track-size: 0.45em;
  --fp-track-color: #444444;
  --fp-track-num-color: #aaaaaa;
  --fp-track-columns: 2;
  --fp-track-gap: 0.3em;
  --fp-border-color: #111111;
  --fp-border-width: 2px;
  --fp-qr-size: 48px;
  --fp-qr-fg: #111111;
  --fp-qr-bg: #ffffff;
  --fp-padding: 5%;
  --fp-gap: 0.6em;

  /* ── Background Art Effects ── */

  /* Opacity of the blurred album art background */
  /* 0 = plain background, 0.15 = subtle, 0.3 = strong */
  --fp-bg-art-opacity: 0.15;

  /* Blur amount on the background album art layer */
  /* 0px = sharp, 40px = soft bloom, 80px = very diffused */
  --fp-bg-blur: 40px;

  /* Dark/light overlay on top of the blurred art */
  /* Increase alpha to darken, decrease to lighten */
  --fp-bg-overlay: rgba(0, 0, 0, 0.55);

  /* Edge vignette strength */
  /* 0 = no vignette, 0.4 = subtle, 0.8 = heavy */
  --fp-vignette-opacity: 0.4;

  /* Vignette tint color — auto set from dominant color */
  /* Override with any rgba() value */
  --fp-vignette-color: rgba(0, 0, 0, 0.6);

  /* Ghost watermark behind tracklist — 0 = off by default */
  /* Try 0.04 to 0.08 for a subtle effect */
  --fp-ghost-opacity: 0;
}
`;

export const AI_THEME_PROMPT = `I am going to show you a poster image. Based on the visual style of this image, I want you to fill in a CSS variables file for a music album poster web app called Trashframe.

Your job is to look at the image and extract:
- Background color or texture feel (translate to a hex color)
- Text colors for headings, body, and muted metadata
- Font style vibe (serif, sans-serif, monospace, handwritten) and suggest a matching Google Font for each
- Image treatment (black and white, sepia, color, high contrast)
- Border style (thin, thick, none, ornate, dashed)
- Overall mood (minimal, vintage, dark, neon, editorial, etc.)

Then return ONLY a filled .css file using the exact template below. Rules:
- Do NOT rename any variable
- Do NOT add any new variables
- Only change the values on the right side of the colon
- For fonts: use real Google Fonts that match the mood
- For --fp-image-filter: use a CSS filter string e.g. grayscale(100%) or sepia(70%) or none
- For --fp-track-columns: use 1, 2, or 3 only
- Return only the CSS file, no explanation, no markdown code fences, just raw CSS

Here is the template to fill:

/* Trashframe Theme — generated from image */

#poster-root {
  /* Poster background color */
  --fp-bg: ;

  /* Album image CSS filter */
  --fp-image-filter: ;

  /* Album image border radius */
  --fp-image-radius: ;

  /* Album title */
  --fp-heading-font: ;
  --fp-heading-size: ;
  --fp-heading-color: ;
  --fp-heading-weight: ;
  --fp-heading-spacing: ;

  /* Artist subtitle */
  --fp-subtitle-color: ;
  --fp-subtitle-size: ;

  /* Metadata (track count, duration, date) */
  --fp-meta-color: ;
  --fp-meta-size: ;

  /* Cursive quote */
  --fp-quote-font: ;
  --fp-quote-size: ;
  --fp-quote-color: ;
  --fp-quote-style: ;

  /* Tracklist */
  --fp-track-font: ;
  --fp-track-size: ;
  --fp-track-color: ;
  --fp-track-num-color: ;
  --fp-track-columns: ;
  --fp-track-gap: ;

  /* Border around poster */
  --fp-border-color: ;
  --fp-border-width: ;

  /* QR / Spotify code sizing */
  --fp-qr-size: ;
  --fp-qr-fg: ;
  --fp-qr-bg: ;

  /* Layout spacing */
  --fp-padding: ;
  --fp-gap: ;

  /* ── Background Art Effects ── */

  /* Opacity of the blurred album art background */
  /* 0 = plain background, 0.15 = subtle, 0.3 = strong */
  --fp-bg-art-opacity: ;

  /* Blur amount on the background album art layer */
  /* 0px = sharp, 40px = soft bloom, 80px = very diffused */
  --fp-bg-blur: ;

  /* Dark/light overlay on top of the blurred art */
  /* Use rgba — increase alpha to darken, decrease to lighten */
  --fp-bg-overlay: ;

  /* Edge vignette strength */
  /* 0 = no vignette, 0.4 = subtle, 0.8 = heavy */
  --fp-vignette-opacity: ;

  /* Vignette tint color */
  /* Use rgba() value matching the poster mood */
  --fp-vignette-color: ;

  /* Ghost watermark behind tracklist — 0 = off */
  /* Try 0.04 to 0.08 for a subtle effect */
  --fp-ghost-opacity: ;
}
`;

export const PRESET_THEMES = [
  {
    id: "default",
    name: "Classic",
    layout: "classic",
    desc: "Clean black & white minimal",
    colors: ["#ffffff", "#111111", "#999999"],
    css: null,
  },
  {
    id: "warm-cream",
    name: "Gallery",
    layout: "gallery",
    desc: "Title above art, credits bottom",
    colors: ["#f0e6d3", "#1a1a1a", "#8b7d6b"],
    css: `#poster-root {
  --fp-bg: #f0e6d3;
  --fp-image-filter: none;
  --fp-image-radius: 0px;
  --fp-heading-font: 'DM Serif Display', serif;
  --fp-heading-size: 1.9em;
  --fp-heading-color: #1a1a1a;
  --fp-heading-weight: 400;
  --fp-heading-spacing: 0.06em;
  --fp-subtitle-color: #4a4a4a;
  --fp-subtitle-size: 0.65em;
  --fp-meta-color: #8b7d6b;
  --fp-meta-size: 0.4em;
  --fp-quote-font: 'Cormorant Garamond', serif;
  --fp-quote-size: 0.85em;
  --fp-quote-color: rgba(255,255,255,0.55);
  --fp-quote-style: italic;
  --fp-track-font: 'DM Sans', sans-serif;
  --fp-track-size: 0.38em;
  --fp-track-color: #333333;
  --fp-track-num-color: #999999;
  --fp-track-columns: 2;
  --fp-track-gap: 0.12em;
  --fp-border-color: transparent;
  --fp-border-width: 0px;
  --fp-qr-size: 34px;
  --fp-qr-fg: #1a1a1a;
  --fp-qr-bg: #f0e6d3;
  --fp-padding: 4%;
  --fp-gap: 0em;
  --fp-bg-art-opacity: 0;
  --fp-vignette-opacity: 0;
}`,
  },
  {
    id: "vinyl-purple",
    name: "Overlay",
    layout: "overlay",
    desc: "Art fills background, text overlaid",
    colors: ["#e6ddd0", "#6b2fa0", "#d94f9e"],
    css: `#poster-root {
  --fp-bg: #e6ddd0;
  --fp-image-filter: saturate(1.3) contrast(1.05);
  --fp-image-radius: 0px;
  --fp-heading-font: 'Bebas Neue', sans-serif;
  --fp-heading-size: 2.2em;
  --fp-heading-color: #6b2fa0;
  --fp-heading-weight: 400;
  --fp-heading-spacing: 0.03em;
  --fp-subtitle-color: #8b4dbb;
  --fp-subtitle-size: 0.9em;
  --fp-meta-color: #a07dba;
  --fp-meta-size: 0.48em;
  --fp-quote-font: 'Caveat', cursive;
  --fp-quote-size: 1.2em;
  --fp-quote-color: #d94f9e;
  --fp-quote-style: normal;
  --fp-track-font: 'IBM Plex Mono', monospace;
  --fp-track-size: 0.4em;
  --fp-track-color: #4a2a6a;
  --fp-track-num-color: #b08dd4;
  --fp-track-columns: 1;
  --fp-track-gap: 0.15em;
  --fp-border-color: transparent;
  --fp-border-width: 0px;
  --fp-qr-size: 40px;
  --fp-qr-fg: #6b2fa0;
  --fp-qr-bg: rgba(230,221,208,0.85);
  --fp-padding: 5%;
  --fp-gap: 0.4em;
}`,
  },
  {
    id: "editorial-mono",
    name: "Editorial",
    layout: "editorial",
    desc: "Magazine style, big quote, ruled footer",
    colors: ["#ffffff", "#0a0a0a", "#888888"],
    css: `#poster-root {
  --fp-bg: #ffffff;
  --fp-image-filter: grayscale(100%) contrast(1.2);
  --fp-image-radius: 0px;
  --fp-heading-font: 'Playfair Display', serif;
  --fp-heading-size: 3.0em;
  --fp-heading-color: #0a0a0a;
  --fp-heading-weight: 900;
  --fp-heading-spacing: -0.02em;
  --fp-subtitle-color: #333333;
  --fp-subtitle-size: 0.55em;
  --fp-meta-color: #777777;
  --fp-meta-size: 0.4em;
  --fp-quote-font: 'Playfair Display', serif;
  --fp-quote-size: 0.55em;
  --fp-quote-color: #1a1a1a;
  --fp-quote-style: italic;
  --fp-track-font: 'Playfair Display', serif;
  --fp-track-size: 0.36em;
  --fp-track-color: #333333;
  --fp-track-num-color: #bbbbbb;
  --fp-track-columns: 2;
  --fp-track-gap: 0.12em;
  --fp-border-color: transparent;
  --fp-border-width: 0px;
  --fp-qr-size: 36px;
  --fp-qr-fg: #0a0a0a;
  --fp-qr-bg: #ffffff;
  --fp-padding: 5%;
  --fp-gap: 0.1em;
  --fp-bg-art-opacity: 0;
  --fp-vignette-opacity: 0;
}`,
  },
  {
    id: "comic-kraft",
    name: "Bold Block",
    layout: "bold-block",
    desc: "Comic poster, massive title, thick border",
    colors: ["#d4c5a9", "#1a1a1a", "#2d7a4f"],
    css: `#poster-root {
  --fp-bg: #2d7a4f;
  --fp-image-filter: contrast(1.3) saturate(0.85);
  --fp-image-radius: 0px;
  --fp-heading-font: 'Anton', sans-serif;
  --fp-heading-size: 3.2em;
  --fp-heading-color: #1a1a1a;
  --fp-heading-weight: 400;
  --fp-heading-spacing: 0.01em;
  --fp-subtitle-color: #1a1a1a;
  --fp-subtitle-size: 0.55em;
  --fp-meta-color: #6b5e4e;
  --fp-meta-size: 0.36em;
  --fp-quote-font: 'Bangers', cursive;
  --fp-quote-size: 0.8em;
  --fp-quote-color: #2d7a4f;
  --fp-quote-style: normal;
  --fp-track-font: 'Courier Prime', monospace;
  --fp-track-size: 0.28em;
  --fp-track-color: #2a2a2a;
  --fp-track-num-color: #8a7d6b;
  --fp-track-columns: 2;
  --fp-track-gap: 0.06em;
  --fp-border-color: #1a1a1a;
  --fp-border-width: 5px;
  --fp-qr-size: 26px;
  --fp-qr-fg: #1a1a1a;
  --fp-qr-bg: #d4c5a9;
  --fp-padding: 0%;
  --fp-gap: 0em;
  --fp-bg-art-opacity: 0;
  --fp-vignette-opacity: 0;
}`,
  },
  {
    id: "clean-teal",
    name: "Minimal",
    layout: "minimal",
    desc: "Ultra-sparse, giant title, inline tracks",
    colors: ["#f5f3ef", "#2a4a4a", "#8a9a9a"],
    css: `#poster-root {
  --fp-bg: #f5f3ef;
  --fp-image-filter: grayscale(70%) contrast(1.1);
  --fp-image-radius: 0px;
  --fp-heading-font: 'Instrument Serif', serif;
  --fp-heading-size: 2.8em;
  --fp-heading-color: #2a3a3a;
  --fp-heading-weight: 400;
  --fp-heading-spacing: -0.04em;
  --fp-subtitle-color: #5a7a7a;
  --fp-subtitle-size: 0.45em;
  --fp-meta-color: #8a9a9a;
  --fp-meta-size: 0.32em;
  --fp-quote-font: 'Instrument Serif', serif;
  --fp-quote-size: 0.65em;
  --fp-quote-color: #4a6a6a;
  --fp-quote-style: italic;
  --fp-track-font: 'DM Sans', sans-serif;
  --fp-track-size: 0.25em;
  --fp-track-color: #5a6a6a;
  --fp-track-num-color: #aabbbb;
  --fp-track-columns: 4;
  --fp-track-gap: 0.04em;
  --fp-border-color: transparent;
  --fp-border-width: 0px;
  --fp-qr-size: 22px;
  --fp-qr-fg: #2a3a3a;
  --fp-qr-bg: #f5f3ef;
  --fp-padding: 5%;
  --fp-gap: 0em;
  --fp-bg-art-opacity: 0;
  --fp-vignette-opacity: 0;
}`,
  },
  {
    id: "red-mono",
    name: "Receipt",
    layout: "receipt",
    desc: "Receipt-style, dashed dividers, total row",
    colors: ["#ece4d8", "#c0392b", "#d4a89a"],
    css: `#poster-root {
  --fp-bg: #ece4d8;
  --fp-image-filter: grayscale(100%) sepia(40%) saturate(3) hue-rotate(-15deg) contrast(1.1);
  --fp-image-radius: 2px;
  --fp-heading-font: 'Archivo Black', sans-serif;
  --fp-heading-size: 2.0em;
  --fp-heading-color: #c0392b;
  --fp-heading-weight: 400;
  --fp-heading-spacing: 0.06em;
  --fp-subtitle-color: #a83228;
  --fp-subtitle-size: 0.75em;
  --fp-meta-color: #d4a89a;
  --fp-meta-size: 0.38em;
  --fp-quote-font: 'Noto Serif', serif;
  --fp-quote-size: 0.9em;
  --fp-quote-color: #c0392b;
  --fp-quote-style: normal;
  --fp-track-font: 'IBM Plex Mono', monospace;
  --fp-track-size: 0.35em;
  --fp-track-color: #8b2020;
  --fp-track-num-color: #d4a89a;
  --fp-track-columns: 1;
  --fp-track-gap: 0.08em;
  --fp-border-color: #c0392b;
  --fp-border-width: 2px;
  --fp-qr-size: 38px;
  --fp-qr-fg: #c0392b;
  --fp-qr-bg: #ece4d8;
  --fp-padding: 5%;
  --fp-gap: 0.25em;
}`,
  },
  {
    id: "deep-ocean",
    name: "Immersive",
    layout: "immersive",
    desc: "Full-bleed image, overlaid text, inline tracks",
    colors: ["#0d1b2a", "#e0e8f0", "#4a7c9b"],
    css: `#poster-root {
  --fp-bg: #0d1b2a;
  --fp-image-filter: brightness(0.8) saturate(1.3);
  --fp-image-radius: 0px;
  --fp-heading-font: 'Oswald', sans-serif;
  --fp-heading-size: 3.0em;
  --fp-heading-color: rgba(255,255,255,0.85);
  --fp-heading-weight: 700;
  --fp-heading-spacing: 0.15em;
  --fp-subtitle-color: rgba(255,255,255,0.5);
  --fp-subtitle-size: 0.6em;
  --fp-meta-color: rgba(255,255,255,0.35);
  --fp-meta-size: 0.35em;
  --fp-quote-font: 'Cormorant Garamond', serif;
  --fp-quote-size: 0.8em;
  --fp-quote-color: rgba(255,255,255,0.65);
  --fp-quote-style: italic;
  --fp-track-font: 'DM Sans', sans-serif;
  --fp-track-size: 0.32em;
  --fp-track-color: rgba(255,255,255,0.6);
  --fp-track-num-color: rgba(255,255,255,0.25);
  --fp-track-columns: 1;
  --fp-track-gap: 0.04em;
  --fp-border-color: transparent;
  --fp-border-width: 0px;
  --fp-qr-size: 32px;
  --fp-qr-fg: rgba(255,255,255,0.6);
  --fp-qr-bg: rgba(0,0,0,0.3);
  --fp-padding: 0%;
  --fp-gap: 0em;
  --fp-bg-art-opacity: 0;
  --fp-vignette-opacity: 0;
}`,
  },
  {
    id: "retro-gold",
    name: "Retro",
    layout: "retro",
    desc: "Bold colors, huge title, framed art, quote bottom",
    colors: ["#e8b931", "#1a2744", "#c49a22"],
    css: `#poster-root {
  --fp-bg: #e8b931;
  --fp-image-filter: sepia(30%) contrast(1.2) saturate(0.9);
  --fp-image-radius: 0px;
  --fp-heading-font: 'Righteous', sans-serif;
  --fp-heading-size: 3.5em;
  --fp-heading-color: #1a2744;
  --fp-heading-weight: 400;
  --fp-heading-spacing: 0.02em;
  --fp-subtitle-color: #2a3a5a;
  --fp-subtitle-size: 0.45em;
  --fp-meta-color: #4a5a7a;
  --fp-meta-size: 0.36em;
  --fp-quote-font: 'Merriweather', serif;
  --fp-quote-size: 0.5em;
  --fp-quote-color: #1a2744;
  --fp-quote-style: italic;
  --fp-track-font: 'Courier Prime', monospace;
  --fp-track-size: 0.28em;
  --fp-track-color: #1a2744;
  --fp-track-num-color: #8a7020;
  --fp-track-columns: 2;
  --fp-track-gap: 0.06em;
  --fp-border-color: #1a2744;
  --fp-border-width: 6px;
  --fp-qr-size: 26px;
  --fp-qr-fg: #1a2744;
  --fp-qr-bg: #e8b931;
  --fp-padding: 5%;
  --fp-gap: 0em;
  --fp-bg-art-opacity: 0;
  --fp-vignette-opacity: 0;
}`,
  },
];
