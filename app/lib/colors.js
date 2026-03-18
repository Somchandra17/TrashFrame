import ColorThief from "colorthief";

function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

function luminance([r, g, b]) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function darken([r, g, b], factor) {
  return rgbToHex([
    Math.round(r * factor),
    Math.round(g * factor),
    Math.round(b * factor),
  ]);
}

/**
 * Load an image with CORS for canvas pixel access.
 * Returns the loaded HTMLImageElement.
 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

/**
 * Extract a 5-color palette from an image URL using ColorThief.
 * Returns { palette, dominant, isDark, autoVars }.
 *
 * palette:   [[r,g,b], ...] — 5 dominant colors
 * dominant:  [r,g,b]        — single most dominant color
 * isDark:    boolean         — true if dominant luminance < 0.5
 * autoVars: object           — CSS variable values auto-derived from palette
 */
export async function extractPalette(imageUrl) {
  const img = await loadImage(imageUrl);
  const thief = new ColorThief();

  const dominant = thief.getColor(img);
  const palette = thief.getPalette(img, 5);

  const lum = luminance(dominant);
  const isDark = lum < 0.5;

  const lightest = palette.reduce((a, b) =>
    luminance(b) > luminance(a) ? b : a
  );

  let autoVars;
  if (isDark) {
    autoVars = {
      "--fp-bg": darken(dominant, 0.2),
      "--fp-heading-color": "#f0f0f0",
      "--fp-subtitle-color": "#bbbbbb",
      "--fp-track-color": "#999999",
      "--fp-meta-color": "#777777",
      "--fp-quote-color": "#dddddd",
      "--fp-bg-overlay": "rgba(0,0,0,0.55)",
      "--fp-vignette-color": `rgba(${dominant[0]},${dominant[1]},${dominant[2]},0.4)`,
      "--fp-qr-fg": "#cccccc",
      "--fp-qr-bg": darken(dominant, 0.2),
      "--fp-border-color": "rgba(255,255,255,0.08)",
      "--fp-track-num-color": "#666666",
    };
  } else {
    autoVars = {
      "--fp-bg": "#fafafa",
      "--fp-heading-color": "#111111",
      "--fp-subtitle-color": "#444444",
      "--fp-track-color": "#555555",
      "--fp-meta-color": "#888888",
      "--fp-quote-color": "#222222",
      "--fp-bg-overlay": "rgba(255,255,255,0.45)",
      "--fp-vignette-color": `rgba(${dominant[0]},${dominant[1]},${dominant[2]},0.4)`,
      "--fp-qr-fg": "#111111",
      "--fp-qr-bg": "#fafafa",
      "--fp-border-color": "#e0e0e0",
      "--fp-track-num-color": "#aaaaaa",
    };
  }

  return {
    palette: palette.map(rgbToHex),
    dominant,
    isDark,
    autoVars,
    barColor: isDark ? "white" : "black",
  };
}

/**
 * Legacy helper — returns hex color array for backward compat with Gallery swatches.
 */
export async function extractDominantColors(imageUrl) {
  try {
    const { palette } = await extractPalette(imageUrl);
    return palette;
  } catch {
    return ["#111111", "#333333"];
  }
}
