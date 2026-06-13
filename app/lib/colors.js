/**
 * Color extraction utilities using native Canvas API
 * No external dependencies required
 */

function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

function luminance([r, g, b]) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * True when a hex color reads as "light" (same 150/255 threshold the
 * Spotify scannable code uses to pick its bar color).
 */
export function isLightHex(hex) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return luminance([r, g, b]) > 150 / 255;
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
 * Extract colors from image using canvas - no external library needed
 */
function getColorsFromCanvas(img, colorCount = 5) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  // Sample at a smaller size for performance
  const sampleSize = 100;
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
  const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
  const pixels = imageData.data;
  
  // Build color buckets using quantization
  const colorMap = {};
  
  for (let i = 0; i < pixels.length; i += 4) {
    // Quantize to 16-step buckets; clamp so 255 doesn't round up to 256
    // (which would produce invalid 3-digit hex channels).
    const r = Math.min(255, Math.round(pixels[i] / 16) * 16);
    const g = Math.min(255, Math.round(pixels[i + 1] / 16) * 16);
    const b = Math.min(255, Math.round(pixels[i + 2] / 16) * 16);
    const a = pixels[i + 3];
    
    // Skip transparent pixels
    if (a < 128) continue;
    
    const key = `${r},${g},${b}`;
    colorMap[key] = (colorMap[key] || 0) + 1;
  }
  
  // Sort by frequency and get top colors
  const sortedColors = Object.entries(colorMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, colorCount * 3) // Get more to filter similar ones
    .map(([key]) => key.split(",").map(Number));
  
  // Filter out colors that are too similar
  const palette = [];
  for (const color of sortedColors) {
    if (palette.length >= colorCount) break;
    
    const isTooSimilar = palette.some((existing) => {
      const diff = Math.abs(existing[0] - color[0]) + 
                   Math.abs(existing[1] - color[1]) + 
                   Math.abs(existing[2] - color[2]);
      return diff < 60;
    });
    
    if (!isTooSimilar) {
      palette.push(color);
    }
  }
  
  // Fill remaining slots if needed
  while (palette.length < colorCount && sortedColors.length > palette.length) {
    const next = sortedColors[palette.length];
    if (next) palette.push(next);
  }
  
  const dominant = palette[0] || [128, 128, 128];
  
  return { dominant, palette };
}

/**
 * Extract a 5-color palette from an image URL.
 * Returns { palette, dominant, isDark, autoVars, barColor }.
 */
export async function extractPalette(imageUrl) {
  const img = await loadImage(imageUrl);
  const { dominant, palette } = getColorsFromCanvas(img, 5);

  const lum = luminance(dominant);
  const isDark = lum < 0.5;

  let autoVars;
  if (isDark) {
    autoVars = {
      // Keep more of the album's hue than a near-black darken (0.2) gave,
      // so the classic background reads as a rich tone rather than flat black.
      "--fp-bg": darken(dominant, 0.3),
      "--fp-heading-color": "#f4f4f4",
      "--fp-subtitle-color": "#c2c2c2",
      "--fp-track-color": "#a6a6a6",
      "--fp-meta-color": "#8a8a8a",
      "--fp-quote-color": "#e2e2e2",
      // Album-aware scrim over the bloom — only the classic layer shows it (posterTheme.css).
      "--fp-bg-overlay": "rgba(0,0,0,0.5)",
      "--fp-vignette-color": `rgba(${Math.round(dominant[0] * 0.4)},${Math.round(dominant[1] * 0.4)},${Math.round(dominant[2] * 0.4)},0.55)`,
      "--fp-qr-fg": "#d4d4d4",
      "--fp-qr-bg": "transparent",
      "--fp-border-color": "rgba(255,255,255,0.08)",
      "--fp-track-num-color": "#6f6f6f",
    };
  } else {
    autoVars = {
      "--fp-bg": "#fafafa",
      "--fp-heading-color": "#111111",
      "--fp-subtitle-color": "#444444",
      "--fp-track-color": "#555555",
      "--fp-meta-color": "#808080",
      "--fp-quote-color": "#222222",
      "--fp-bg-overlay": "rgba(255,255,255,0.35)",
      "--fp-vignette-color": `rgba(${dominant[0]},${dominant[1]},${dominant[2]},0.32)`,
      "--fp-qr-fg": "#111111",
      "--fp-qr-bg": "transparent",
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
