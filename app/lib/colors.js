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
    const r = Math.round(pixels[i] / 16) * 16;
    const g = Math.round(pixels[i + 1] / 16) * 16;
    const b = Math.round(pixels[i + 2] / 16) * 16;
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
      "--fp-bg": darken(dominant, 0.2),
      "--fp-heading-color": "#f0f0f0",
      "--fp-subtitle-color": "#bbbbbb",
      "--fp-track-color": "#999999",
      "--fp-meta-color": "#777777",
      "--fp-quote-color": "#dddddd",
      "--fp-bg-overlay": "rgba(0,0,0,0.55)",
      "--fp-vignette-color": `rgba(${dominant[0]},${dominant[1]},${dominant[2]},0.4)`,
      "--fp-qr-fg": "#cccccc",
      "--fp-qr-bg": "transparent",
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
