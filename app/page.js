"use client";

import { useState, useEffect, useCallback } from "react";
import Poster from "./components/Poster";
import Sidebar from "./components/Sidebar";
import { fetchAlbum } from "./lib/spotify";
import { extractPalette, extractDominantColors } from "./lib/colors";
import { DEFAULT_FRAME, PRESET_THEMES } from "./lib/constants";

function extractFontsFromCss(css) {
  const fonts = new Set();
  
  // 1. Match --fp-*-font variables (single or double quotes)
  const varRe = /--fp-(?:quote|heading|track)-font:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = varRe.exec(css)) !== null) {
    const name = m[1]?.trim();
    if (name) fonts.add(name);
  }

  // 2. Match Google Font names in @import statements
  // Example: @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
  const importRe = /family=([^&:'"]+)/g;
  while ((m = importRe.exec(css)) !== null) {
    const name = decodeURIComponent(m[1].replace(/\+/g, " "))?.trim();
    if (name) fonts.add(name);
  }

  const system = [
    "Arial", "Helvetica", "Courier New", "Georgia",
    "Times New Roman", "sans-serif", "serif", "monospace", "cursive", "fantasy", "system-ui"
  ];

  return [...fonts].filter(f => !system.includes(f) && !f.startsWith("Geist"));
}

function loadGoogleFonts(fonts) {
  fonts.forEach((f) => {
    const id = `gf-${f.replace(/\s+/g, "-").toLowerCase()}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.crossOrigin = "anonymous";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f)}:wght@400;700;900&display=swap`;
    document.head.appendChild(link);
  });
}

const DEFAULT_OVERRIDES = {
  titleFontScale: 1.0,
  tracklistFontScale: 1.0,
  colorCover: false,
  gradientBg: false,
  codeType: "qr",
  gradientColors: null,
  ghostOpacity: 0,
  fontColor: null,
  hideDate: false,
  hideArtist: false,
  quoteFont: "",
  artZoom: 1.0,
  artPosX: 50,
  artPosY: 50,
  artBrightness: 100,
  artContrast: 100,
};

const EMPTY_COLORS = [];

export default function Home() {
  const [url, setUrl] = useState("");
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [frameSize, setFrameSize] = useState(DEFAULT_FRAME);
  const [quote, setQuote] = useState("");
  const [customTheme, setCustomTheme] = useState(null);
  const [activePreset, setActivePreset] = useState("default");
  const [posterOverrides, setPosterOverrides] = useState(DEFAULT_OVERRIDES);
  const [albumColors, setAlbumColors] = useState(EMPTY_COLORS);
  const [paletteData, setPaletteData] = useState(null);

  // Derive the active theme layout
  const currentPreset = (!customTheme && activePreset !== "default") 
    ? PRESET_THEMES.find((p) => p.id === activePreset) 
    : null;

  useEffect(() => {
    if (!album?.coverUrl) {
      setAlbumColors(EMPTY_COLORS);
      setPaletteData(null);
      return;
    }
    let cancelled = false;
    extractPalette(album.coverUrl)
      .then((data) => {
        if (cancelled) return;
        setAlbumColors(data.palette);
        setPaletteData(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [album?.coverUrl]);

  // Load saved themes on mount
  useEffect(() => {
    const savedCustom = localStorage.getItem("poster_custom_css");
    const savedPreset = localStorage.getItem("poster_preset");

    if (savedCustom) {
      setCustomTheme(savedCustom);
      loadGoogleFonts(extractFontsFromCss(savedCustom));
    } else if (savedPreset && savedPreset !== "default") {
      setActivePreset(savedPreset);
      const preset = PRESET_THEMES.find((p) => p.id === savedPreset);
      if (preset?.css) {
        loadGoogleFonts(extractFontsFromCss(preset.css));
      }
    }
    loadGoogleFonts(["Dancing Script"]); // Default signature font
  }, []);

  // Compute gradient background automatically
  useEffect(() => {
    if (!posterOverrides.gradientBg || !album?.coverUrl) return;
    if (posterOverrides.gradientColors) return;

    let cancelled = false;
    extractDominantColors(album.coverUrl)
      .then((colors) => {
        if (cancelled) return;
        setPosterOverrides((prev) => ({ ...prev, gradientColors: colors }));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [posterOverrides.gradientBg, album?.coverUrl, posterOverrides.gradientColors]);

  const handleOverridesChange = useCallback((next) => {
    if (!next.gradientBg) {
      next.gradientColors = null;
    } else if (next.gradientBg && !next.gradientColors) {
      next.gradientColors = null;
    }
    setPosterOverrides(next);
  }, []);

  const handleSelectPreset = useCallback((presetId) => {
    const preset = PRESET_THEMES.find((p) => p.id === presetId);
    if (!preset) return;

    setCustomTheme(null);
    setActivePreset(presetId);
    localStorage.removeItem("poster_custom_css");
    localStorage.setItem("poster_preset", presetId);

    if (preset.css) {
      loadGoogleFonts(extractFontsFromCss(preset.css));
    }
  }, []);

  const handleUploadTheme = useCallback((css) => {
    setCustomTheme(css);
    localStorage.setItem("poster_custom_css", css);
    localStorage.removeItem("poster_preset");
    loadGoogleFonts(extractFontsFromCss(css));
  }, []);

  const handleResetTheme = useCallback(() => {
    setCustomTheme(null);
    setActivePreset("default");
    localStorage.removeItem("poster_custom_css");
    localStorage.setItem("poster_preset", "default");
  }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    try {
      const data = await fetchAlbum(url.trim());
      setAlbum(data);
      setPosterOverrides(DEFAULT_OVERRIDES);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- Declarative CSS Rendering ---

  const autoColorsCss = (paletteData?.autoVars && !customTheme)
    ? `#poster-root {\n${Object.entries(paletteData.autoVars).map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}`
    : "";

  const themeCss = customTheme || currentPreset?.css || "";

  let overrideRules = [];
  const o = posterOverrides;
  
  if (o.titleFontScale && o.titleFontScale !== 1.0) {
    overrideRules.push(`.poster-title, .playlist-title, .comic-header h1 { zoom: ${o.titleFontScale} !important; }`);
  }
  if (o.tracklistFontScale && o.tracklistFontScale !== 1.0) {
    overrideRules.push(`.poster-tracklist, .poster-meta, .poster-track-dur, .poster-track-num, .poster-track-name { zoom: ${o.tracklistFontScale} !important; }`);
  }
  
  if (o.gradientBg && o.gradientColors?.length >= 2) {
    const [c1, c2] = o.gradientColors;
    overrideRules.push(`--fp-bg: linear-gradient(135deg, ${c1}, ${c2})`);
  }
  if (o.ghostOpacity > 0) overrideRules.push(`--fp-ghost-opacity: ${o.ghostOpacity}`);
  if (o.fontColor) {
    overrideRules.push(`--fp-heading-color: ${o.fontColor}`);
    overrideRules.push(`--fp-subtitle-color: ${o.fontColor}`);
    overrideRules.push(`--fp-track-color: ${o.fontColor}`);
    overrideRules.push(`--fp-quote-color: ${o.fontColor}`);
    overrideRules.push(`--fp-meta-color: ${o.fontColor}cc`);
    overrideRules.push(`--fp-track-num-color: ${o.fontColor}88`);
  }
  if (o.hideDate) overrideRules.push(`.poster-date { display: none !important; } .poster-meta { display: none !important; }`);
  if (o.hideArtist) overrideRules.push(`.poster-artist { display: none !important; } .poster-track-artists { display: none !important; }`);
  if (o.quoteFont) {
    overrideRules.push(`--fp-quote-font: '${o.quoteFont}', sans-serif`);
    loadGoogleFonts([o.quoteFont]);
  }
  // Album art adjustments
  const artFilters = [];
  if (o.colorCover) artFilters.push('grayscale(0)');
  if (o.artBrightness && o.artBrightness !== 100) artFilters.push(`brightness(${o.artBrightness}%)`);
  if (o.artContrast && o.artContrast !== 100) artFilters.push(`contrast(${o.artContrast}%)`);
  if (artFilters.length > 0) {
    overrideRules.push(`--fp-image-filter: ${artFilters.join(' ')}`);
  }
  if (o.artZoom && o.artZoom !== 1.0) {
    overrideRules.push(`.poster-cover, .poster-8bit-cover, .poster-cover-fullbleed, .poster-cover-hero, .poster-cover-bg { transform: scale(${o.artZoom}) }`);
  }
  if ((o.artPosX && o.artPosX !== 50) || (o.artPosY && o.artPosY !== 50)) {
    overrideRules.push(`.poster-cover, .poster-8bit-cover, .poster-cover-fullbleed, .poster-cover-hero, .poster-cover-bg { object-position: ${o.artPosX ?? 50}% ${o.artPosY ?? 50}% }`);
  }
  
  const overridesCss = overrideRules.length > 0 
    ? `#poster-root {\n  ${overrideRules.join(" !important;\n  ")} !important;\n}` 
    : "";

  // ---------------------------------

  if (!album) {
    return (
      <div className="landing-page">
        {/* Soft pastel accent blurs */}
        <div className="landing-accent accent-1" />
        <div className="landing-accent accent-2" />
        <div className="landing-accent accent-3" />

        {/* Scattered hand-drawn doodles */}
        <div className="landing-doodles">
          {/* Music note */}
          <svg className="doodle" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
          </svg>
          {/* Vinyl record */}
          <svg className="doodle" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="1" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
          </svg>
          {/* Headphones */}
          <svg className="doodle" width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
          </svg>
          {/* Picture frame */}
          <svg className="doodle" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="1" strokeLinecap="round">
            <rect x="2" y="3" width="20" height="18" rx="1" /><rect x="5" y="6" width="14" height="12" rx="0.5" />
          </svg>
          {/* Speaker */}
          <svg className="doodle" width="65" height="65" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="1.2" strokeLinecap="round">
            <rect x="4" y="2" width="16" height="20" rx="2" /><circle cx="12" cy="14" r="4" /><circle cx="12" cy="14" r="1.5" /><circle cx="12" cy="6" r="1.5" />
          </svg>
          {/* Cassette tape */}
          <svg className="doodle" width="85" height="85" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="1" strokeLinecap="round">
            <rect x="1" y="4" width="22" height="16" rx="2" /><circle cx="8" cy="12" r="3" /><circle cx="16" cy="12" r="3" /><path d="M8 15h8" /><path d="M6 20h12" />
          </svg>
          {/* Star / sparkle */}
          <svg className="doodle" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.09 6.26L20 9.27l-4.74 3.74L16.18 20 12 16.77 7.82 20l.92-6.99L4 9.27l5.91-1.01z" />
          </svg>
          {/* Another music note */}
          <svg className="doodle" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="1.2" strokeLinecap="round">
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
          </svg>
        </div>

        {/* Main Content */}
        <div className="landing-content">
          <h1 className="landing-title">TrashFrame</h1>
          <p className="landing-subtitle">Turn any Spotify album into a printable poster</p>

          <form onSubmit={handleGenerate} className="landing-form">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a Spotify album link…"
              className="landing-input"
            />
            <button type="submit" disabled={loading || !url.trim()} className="landing-btn">
              {loading ? "Loading…" : "Generate"}
            </button>
          </form>

          {error && <p className="landing-error">{error}</p>}

          <div className="landing-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><rect x="7" y="7" width="10" height="10" rx="1" /></svg>
            Frame it. Print it. Hang it.
          </div>
        </div>
      </div>
    );
  }

  const currentLayout = customTheme ? "classic" : (currentPreset?.layout || "classic");

  return (
    <>
      <style id="poster-auto-colors" dangerouslySetInnerHTML={{ __html: autoColorsCss }} suppressHydrationWarning />
      <style id="poster-theme" dangerouslySetInnerHTML={{ __html: themeCss }} suppressHydrationWarning />
      <style id="poster-overrides" dangerouslySetInnerHTML={{ __html: overridesCss }} suppressHydrationWarning />
      
      <div className="min-h-screen flex flex-col">
        <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-100">
          <button
            onClick={() => setAlbum(null)}
            className="text-base font-bold tracking-tight text-zinc-900 hover:opacity-70 transition"
          >
            TrashFrame
          </button>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 p-4 lg:p-12 overflow-hidden">
          <div className="flex-1 flex items-start justify-center overflow-auto min-h-0 py-10 lg:py-12 px-6">
            <div className="w-full max-w-[500px] relative gallery-frame mx-auto shrink-0">
              <div className="gallery-frame-inner">
                <Poster
                album={album}
                quote={quote}
                frameSize={frameSize}
                layout={currentLayout}
                codeType={posterOverrides.codeType}
                albumColors={albumColors}
                barColor={paletteData?.barColor}
              />
              </div>
            </div>
          </div>

          <Sidebar
            frameSize={frameSize}
            setFrameSize={setFrameSize}
            quote={quote}
            setQuote={setQuote}
            customTheme={customTheme}
            activePreset={activePreset}
            onSelectPreset={handleSelectPreset}
            onUploadTheme={handleUploadTheme}
            onResetTheme={handleResetTheme}
            albumName={album.name}
            overrides={posterOverrides}
            onChangeOverrides={handleOverridesChange}
          />
        </div>
      </div>
    </>
  );
}
