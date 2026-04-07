"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Poster from "./components/Poster";
import Sidebar from "./components/Sidebar";
import HelpModal from "./components/HelpModal";
import Image from "next/image";
import { fetchSpotifyItem } from "./lib/spotify";
import { extractPalette, extractDominantColors } from "./lib/colors";
import { DEFAULT_FRAME, PRESET_THEMES } from "./lib/constants";

const RECENT_KEY = "trashframe_recent";
const MAX_RECENT = 6;
const DEMO_SPOTIFY_URL = "https://open.spotify.com/album/5poA9SAx0Xiz1cf17fWBLS?si=PtJAoI4ORvuLzorUZE9Q_Q";

function loadRecent() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch { return []; }
}

function saveRecent(item) {
  if (typeof window === "undefined") return;
  const recent = loadRecent().filter(r => r.spotifyUrl !== item.spotifyUrl);
  recent.unshift(item);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function extractFontsFromCss(css) {
  const fonts = new Set();
  
  const varRe = /--fp-(?:quote|heading|track)-font:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = varRe.exec(css)) !== null) {
    const name = m[1]?.trim();
    if (name) fonts.add(name);
  }

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
  bgColor: null,
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

const MOBILE_DISMISSED_KEY = "trashframe_mobile_dismissed";

function MobilePrompt() {
  const [dismissed, setDismissed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(MOBILE_DISMISSED_KEY)) {
      setDismissed(true);
    }
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(MOBILE_DISMISSED_KEY, "1");
  };

  const show = isMobile && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="mobile-prompt"
          className="mobile-prompt-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="mobile-prompt-card"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="mobile-prompt-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h2 className="mobile-prompt-title">Desktop Recommended</h2>
            <p className="mobile-prompt-desc">
              TrashFrame works best on a larger screen. For the full editing experience
              with poster preview, theme controls, and high-quality export, please switch
              to a desktop or laptop.
            </p>
            <div className="mobile-prompt-actions">
              <button
                onClick={handleDismiss}
                className="mobile-prompt-continue"
              >
                Continue Anyway
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AuthorCredit({ className = "" }) {
  const links = [
    { label: "GitHub", href: "https://github.com/Somchandra17" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/somchandra17/" },
    { label: "Website", href: "https://somm.tf" },
  ];

  return (
    <footer className={`author-credit ${className}`.trim()}>
      <span className="author-credit-name">Made by Som</span>
      {links.map(({ label, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="author-credit-link"
        >
          {label}
        </a>
      ))}
    </footer>
  );
}

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
  const [fullscreen, setFullscreen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [recentItems, setRecentItems] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const undoRef = useRef({ past: [], future: [] });
  const [undoVersion, setUndoVersion] = useState(0);

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
    loadGoogleFonts(["Dancing Script"]);
  }, []);

  useEffect(() => {
    if (!posterOverrides.gradientBg || !album?.coverUrl) return;
    if (posterOverrides.gradientColors) return;

    let cancelled = false;
    extractDominantColors(album.coverUrl)
      .then((colors) => {
        if (cancelled) return;
        setPosterOverrides((prev) => {
          undoRef.current.past.push(prev);
          if (undoRef.current.past.length > 50) undoRef.current.past.shift();
          undoRef.current.future = [];
          return { ...prev, gradientColors: colors };
        });
        setUndoVersion(v => v + 1);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [posterOverrides.gradientBg, album?.coverUrl, posterOverrides.gradientColors]);

  useEffect(() => {
    if (posterOverrides.quoteFont) {
      loadGoogleFonts([posterOverrides.quoteFont]);
    }
  }, [posterOverrides.quoteFont]);

  useEffect(() => {
    setRecentItems(loadRecent());
  }, []);

  useEffect(() => {
    if (fullscreen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [fullscreen]);

  const handleOverridesChange = useCallback((next) => {
    const cleaned = { ...next };
    if (!cleaned.gradientBg) {
      cleaned.gradientColors = null;
    } else if (cleaned.gradientBg && !cleaned.gradientColors) {
      cleaned.gradientColors = null;
    }
    setPosterOverrides(prev => {
      undoRef.current.past.push(prev);
      if (undoRef.current.past.length > 50) undoRef.current.past.shift();
      undoRef.current.future = [];
      return cleaned;
    });
    setUndoVersion(v => v + 1);
  }, []);

  const handleUndo = useCallback(() => {
    const { past } = undoRef.current;
    if (past.length === 0) return;
    const prev = past.pop();
    setPosterOverrides(current => {
      undoRef.current.future.push(current);
      return prev;
    });
    setUndoVersion(v => v + 1);
  }, []);

  const handleRedo = useCallback(() => {
    const { future } = undoRef.current;
    if (future.length === 0) return;
    const next = future.pop();
    setPosterOverrides(current => {
      undoRef.current.past.push(current);
      return next;
    });
    setUndoVersion(v => v + 1);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (fullscreen && e.key === "Escape") {
        setFullscreen(false);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fullscreen, handleUndo, handleRedo]);

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

  async function loadSpotifyItem(spotifyUrl) {
    setLoading(true);
    setError("");
    try {
      const data = await fetchSpotifyItem(spotifyUrl);
      setAlbum(data);
      setPosterOverrides(DEFAULT_OVERRIDES);
      undoRef.current = { past: [], future: [] };
      setUndoVersion(v => v + 1);
      const entry = { name: data.name, artists: data.artists, coverUrl: data.coverUrl, spotifyUrl: data.spotifyUrl };
      saveRecent(entry);
      setRecentItems(loadRecent());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(e) {
    e.preventDefault();
    if (!url.trim()) return;
    await loadSpotifyItem(url.trim());
  }

  async function handleSelectRecent(spotifyUrl) {
    setUrl(spotifyUrl);
    await loadSpotifyItem(spotifyUrl);
  }

  const currentLayout = customTheme ? "classic" : (currentPreset?.layout || "classic");

  const suppressAutoColors = currentLayout === "masterpiece-receipt";
  const autoColorsCss = (paletteData?.autoVars && !customTheme && !suppressAutoColors)
    ? `#poster-root {\n${Object.entries(paletteData.autoVars).map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}`
    : "";

  const themeCss = customTheme || currentPreset?.css || "";

  const varOverrides = [];
  const selectorOverrides = [];
  const o = posterOverrides;

  if (o.titleFontScale && o.titleFontScale !== 1.0) {
    selectorOverrides.push(`#poster-root .poster-title, #poster-root .playlist-title, #poster-root .comic-header h1 { zoom: ${o.titleFontScale} !important; }`);
  }
  if (o.tracklistFontScale && o.tracklistFontScale !== 1.0) {
    selectorOverrides.push(`#poster-root .poster-tracklist, #poster-root .poster-meta, #poster-root .poster-track-dur, #poster-root .poster-track-num, #poster-root .poster-track-name { zoom: ${o.tracklistFontScale} !important; }`);
  }

  if (o.bgColor) {
    varOverrides.push(`--fp-bg: ${o.bgColor}`);
  }
  if (o.gradientBg && o.gradientColors?.length >= 2) {
    const [c1, c2] = o.gradientColors;
    varOverrides.push(`--fp-bg: linear-gradient(135deg, ${c1}, ${c2})`);
  }
  if (o.ghostOpacity > 0) varOverrides.push(`--fp-ghost-opacity: ${o.ghostOpacity}`);
  if (o.fontColor) {
    varOverrides.push(`--fp-heading-color: ${o.fontColor}`);
    varOverrides.push(`--fp-subtitle-color: ${o.fontColor}`);
    varOverrides.push(`--fp-track-color: ${o.fontColor}`);
    varOverrides.push(`--fp-quote-color: ${o.fontColor}`);
    varOverrides.push(`--fp-meta-color: ${o.fontColor}cc`);
    varOverrides.push(`--fp-track-num-color: ${o.fontColor}88`);
    varOverrides.push(`--fp-border-color: ${o.fontColor}`);
    varOverrides.push(`--fp-qr-fg: ${o.fontColor}`);
  }
  if (o.codeColor) {
    varOverrides.push(`--fp-qr-fg: ${o.codeColor}`);
  }
  if (o.hideDate) selectorOverrides.push(`#poster-root .poster-date { display: none !important; }`);
  if (o.hideArtist) selectorOverrides.push(`#poster-root .poster-artist { display: none !important; } #poster-root .poster-track-artists { display: none !important; }`);
  if (o.quoteFont) {
    varOverrides.push(`--fp-quote-font: '${o.quoteFont}', sans-serif`);
  }
  const artFilters = [];
  if (o.colorCover) artFilters.push('grayscale(0)');
  if (o.artBrightness && o.artBrightness !== 100) artFilters.push(`brightness(${o.artBrightness}%)`);
  if (o.artContrast && o.artContrast !== 100) artFilters.push(`contrast(${o.artContrast}%)`);
  if (artFilters.length > 0) {
    varOverrides.push(`--fp-image-filter: ${artFilters.join(' ')}`);
  }
  if (o.artZoom != null && o.artZoom !== 1.0) {
    selectorOverrides.push(`#poster-root .poster-cover, #poster-root .poster-cover-fullbleed, #poster-root .poster-cover-hero, #poster-root .poster-cover-bg { transform: scale(${o.artZoom}) !important; }`);
  }
  if ((o.artPosX != null && o.artPosX !== 50) || (o.artPosY != null && o.artPosY !== 50)) {
    selectorOverrides.push(`#poster-root .poster-cover, #poster-root .poster-cover-fullbleed, #poster-root .poster-cover-hero, #poster-root .poster-cover-bg { object-position: ${o.artPosX ?? 50}% ${o.artPosY ?? 50}% !important; }`);
  }

  let overridesCss = "";
  if (varOverrides.length > 0) {
    overridesCss += `#poster-root {\n  ${varOverrides.join(" !important;\n  ")} !important;\n}`;
  }
  if (selectorOverrides.length > 0) {
    overridesCss += `\n${selectorOverrides.join("\n")}`;
  }

  if (!album) {
    return (
      <>
        <MobilePrompt />
        <div className="landing-page">
          <div className="landing-shell">
            <motion.div
              className="landing-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.span
                className="landing-kicker"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05, ease: [0.4, 0, 0.2, 1] }}
              >
                Album to poster
              </motion.span>
              <motion.h1
                className="landing-title"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
              >
                Turn your favorite albums
                <span className="landing-title-break">into something you can hang.</span>
              </motion.h1>
              <motion.p
                className="landing-subtitle"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.16, ease: [0.4, 0, 0.2, 1] }}
              >
                Paste a Spotify album link and generate a clean, customizable poster in a few seconds.
              </motion.p>

              <motion.form
                onSubmit={handleGenerate}
                className="landing-form"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.22, ease: [0.4, 0, 0.2, 1] }}
              >
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste a Spotify link..."
                  className="landing-input"
                />
                <button type="submit" disabled={loading || !url.trim()} className="landing-btn">
                  {loading ? <><span className="landing-spinner" />Working...</> : "Create"}
                </button>
              </motion.form>

              <motion.div
                className="landing-actions"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.28, ease: [0.4, 0, 0.2, 1] }}
              >
                <button
                  type="button"
                  className="landing-link-btn"
                  onClick={() => {
                    setUrl(DEMO_SPOTIFY_URL);
                    loadSpotifyItem(DEMO_SPOTIFY_URL);
                  }}
                  disabled={loading}
                >
                  Try demo album
                </button>
                <span className="landing-meta">Albums, tracks, and playlists. PNG + PDF export.</span>
              </motion.div>

              {error && <p className="landing-error">{error}</p>}
            </motion.div>

            <motion.div
              className="landing-showcase"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="landing-showcase-card landing-showcase-card-top"
                animate={{ y: [0, -6, 0], rotate: [0, 1.2, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
              >
                Framed print
              </motion.div>
              <motion.div
                className="landing-showcase-card landing-showcase-card-bottom"
                animate={{ y: [0, 7, 0], rotate: [0, -1.2, 0] }}
                transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
              >
                Album art
              </motion.div>
              <motion.div
                className="landing-showcase-image-wrap"
                animate={{ y: [0, -10, 0], rotate: [-1.2, 1.2, -1.2] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/images/hero-frame-transparent.png"
                  alt="Framed album poster preview"
                  width={480}
                  height={280}
                  className="landing-showcase-img"
                  priority
                />
              </motion.div>
            </motion.div>
          </div>

          <div className="landing-bottom">
            {recentItems.length > 0 && (
              <div className="recent-section">
                <div className="recent-header">
                  <span className="recent-label">Recent</span>
                  <button
                    className="recent-clear-btn"
                    onClick={() => { localStorage.removeItem(RECENT_KEY); setRecentItems([]); }}
                  >
                    Clear
                  </button>
                </div>
                <div className="recent-grid">
                  {recentItems.map((item) => (
                    <button
                      key={item.spotifyUrl}
                      className="recent-card"
                      onClick={() => handleSelectRecent(item.spotifyUrl)}
                      disabled={loading}
                    >
                      {item.coverUrl ? (
                        <Image
                          src={item.coverUrl}
                          alt=""
                          width={28}
                          height={28}
                          className="recent-card-img"
                          unoptimized
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      ) : (
                        <span className="recent-card-img-placeholder" />
                      )}
                      <div className="recent-card-info">
                        <span className="recent-card-name">{item.name}</span>
                        <span className="recent-card-artist">{item.artists}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <AuthorCredit />
          </div>
        </div>
      </>
    );
  }

  // undoVersion triggers re-evaluation when undo history changes
  const canUndo = undoVersion >= 0 && undoRef.current.past.length > 0;
  const canRedo = undoVersion >= 0 && undoRef.current.future.length > 0;

  return (
    <>
      <MobilePrompt />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <style id="poster-auto-colors" dangerouslySetInnerHTML={{ __html: autoColorsCss }} suppressHydrationWarning />
      <style id="poster-theme" dangerouslySetInnerHTML={{ __html: themeCss }} suppressHydrationWarning />
      <style id="poster-overrides" dangerouslySetInnerHTML={{ __html: overridesCss }} suppressHydrationWarning />
      
      <div className={`editor-root ${fullscreen ? "editor-fullscreen" : ""}`}>
        <motion.div
          className="editor-preview"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="editor-preview-inner">
            {fullscreen && (
              <button onClick={() => setFullscreen(false)} className="fullscreen-close-btn" title="Exit fullscreen (Esc)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <div className="gallery-frame">
              <motion.div
                key={`${activePreset}-${customTheme ? 'custom' : 'preset'}`}
                className="gallery-frame-inner"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
              >
                <Poster
                  album={album}
                  quote={quote}
                  frameSize={frameSize}
                  layout={currentLayout}
                  codeType={posterOverrides.codeType}
                  albumColors={albumColors}
                  barColor={paletteData?.barColor}
                  codeColor={posterOverrides.codeColor}
                />
                <AnimatePresence>
                  {isExporting && (
                    <motion.div
                      className="export-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="export-overlay-spinner" />
                      <span className="export-overlay-text">Rendering&hellip;</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
            <div className="editor-preview-footer">
              <button onClick={() => setFullscreen(!fullscreen)} className="fullscreen-toggle-btn" title={fullscreen ? "Exit fullscreen" : "Fullscreen preview"}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {fullscreen ? (
                    <><polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" /></>
                  ) : (
                    <><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></>
                  )}
                </svg>
              </button>
              {!fullscreen && <AuthorCredit className="editor-credit" />}
            </div>
          </div>
        </motion.div>

        {!fullscreen && (
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
            itemName={album.name}
            overrides={posterOverrides}
            onChangeOverrides={handleOverridesChange}
            albumName={album.name}
            artistName={album.artists}
            onGoBack={() => setAlbum(null)}
            onNewUrl={handleGenerate}
            urlValue={url}
            onUrlChange={setUrl}
            urlLoading={loading}
            urlError={error}
            coverUrl={album.coverUrl}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            onHelpOpen={() => setHelpOpen(true)}
            onExportingChange={setIsExporting}
          />
        )}
      </div>
    </>
  );
}
