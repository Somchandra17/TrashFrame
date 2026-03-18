"use client";

import { useState, useEffect, useCallback } from "react";
import Poster from "./components/Poster";
import Sidebar from "./components/Sidebar";
import PosterControls from "./components/PosterControls";
import { fetchAlbum } from "./lib/spotify";
import { extractPalette, extractDominantColors } from "./lib/colors";
import { DEFAULT_FRAME, PRESET_THEMES } from "./lib/constants";

function ensureStyleTag(id) {
  let tag = document.getElementById(id);
  if (tag) return tag;
  tag = document.createElement("style");
  tag.id = id;
  return tag;
}

function ensureCascadeOrder() {
  const ids = ["poster-auto-colors", "poster-theme", "poster-overrides"];
  const tags = ids.map((id) => document.getElementById(id)).filter(Boolean);
  tags.forEach((t) => document.head.appendChild(t));
}

function injectAutoColors(vars) {
  const tag = ensureStyleTag("poster-auto-colors");
  if (!vars) {
    tag.textContent = "";
    if (!tag.parentNode) document.head.appendChild(tag);
    return;
  }
  const entries = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join("\n");
  tag.textContent = `#poster-root {\n${entries}\n}`;
  if (!tag.parentNode) document.head.appendChild(tag);
  ensureCascadeOrder();
}

function injectThemeCss(css) {
  const tag = ensureStyleTag("poster-theme");
  tag.textContent = css || "";
  if (!tag.parentNode) document.head.appendChild(tag);
  ensureCascadeOrder();
}

function injectOverrideCss(css) {
  const tag = ensureStyleTag("poster-overrides");
  tag.textContent = css || "";
  if (!tag.parentNode) document.head.appendChild(tag);
  ensureCascadeOrder();
}

function extractFontsFromCss(css) {
  const fonts = new Set();
  const re = /--fp-(?:quote|heading|track)-font:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    const name = m[1];
    const system = [
      "Arial", "Helvetica", "Courier New", "Georgia",
      "Times New Roman", "sans-serif", "serif", "monospace",
    ];
    if (!system.includes(name) && !name.startsWith("Geist")) {
      fonts.add(name);
    }
  }
  return [...fonts];
}

function loadGoogleFonts(fonts) {
  fonts.forEach((f) => {
    const id = `gf-${f.replace(/\s+/g, "-")}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f)}:wght@400;700;900&display=swap`;
    document.head.appendChild(link);
  });
}

const DEFAULT_OVERRIDES = {
  fontScale: 1.0,
  colorCover: false,
  gradientBg: false,
  codeType: "qr",
  gradientColors: null,
  ghostOpacity: 0,
  fontColor: null,
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
    if (!paletteData?.autoVars) return;
    if (customTheme) return;
    requestAnimationFrame(() => injectAutoColors(paletteData.autoVars));
  }, [paletteData, customTheme]);

  useEffect(() => {
    const savedCustom = localStorage.getItem("poster_custom_css");
    const savedPreset = localStorage.getItem("poster_preset");

    if (savedCustom) {
      setCustomTheme(savedCustom);
      injectThemeCss(savedCustom);
      loadGoogleFonts(extractFontsFromCss(savedCustom));
    } else if (savedPreset && savedPreset !== "default") {
      setActivePreset(savedPreset);
      const preset = PRESET_THEMES.find((p) => p.id === savedPreset);
      if (preset?.css) {
        injectThemeCss(preset.css);
        loadGoogleFonts(extractFontsFromCss(preset.css));
      }
    }

    loadGoogleFonts(["Dancing Script"]);
  }, []);

  useEffect(() => {
    const o = posterOverrides;
    let rules = [];

    if (o.fontScale !== 1.0) {
      rules.push(`font-size: calc(16px * ${o.fontScale})`);
    }

    if (o.colorCover) {
      rules.push("--fp-image-filter: none");
    }

    if (o.gradientBg && o.gradientColors?.length >= 2) {
      const [c1, c2] = o.gradientColors;
      rules.push(`--fp-bg: linear-gradient(135deg, ${c1}, ${c2})`);
    }

    if (o.ghostOpacity > 0) {
      rules.push(`--fp-ghost-opacity: ${o.ghostOpacity}`);
    }

    if (o.fontColor) {
      rules.push(`--fp-heading-color: ${o.fontColor}`);
      rules.push(`--fp-subtitle-color: ${o.fontColor}`);
      rules.push(`--fp-track-color: ${o.fontColor}`);
      rules.push(`--fp-quote-color: ${o.fontColor}`);
      rules.push(`--fp-meta-color: ${o.fontColor}cc`);
      rules.push(`--fp-track-num-color: ${o.fontColor}88`);
    }

    if (rules.length > 0) {
      injectOverrideCss(`#poster-root {\n  ${rules.join(" !important;\n  ")} !important;\n}`);
    } else {
      injectOverrideCss("");
    }
  }, [posterOverrides]);

  useEffect(() => {
    if (!posterOverrides.gradientBg || !album?.coverUrl) {
      return;
    }
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
      injectThemeCss(preset.css);
      loadGoogleFonts(extractFontsFromCss(preset.css));
    } else {
      injectThemeCss("");
    }
    injectAutoColors(null);
  }, []);

  const handleUploadTheme = useCallback((css) => {
    setCustomTheme(css);
    injectThemeCss(css);
    localStorage.setItem("poster_custom_css", css);
    localStorage.removeItem("poster_preset");
    loadGoogleFonts(extractFontsFromCss(css));
    injectAutoColors(null);
  }, []);

  const handleResetTheme = useCallback(() => {
    setCustomTheme(null);
    setActivePreset("default");
    injectThemeCss("");
    localStorage.removeItem("poster_custom_css");
    localStorage.setItem("poster_preset", "default");
    if (paletteData?.autoVars) {
      injectAutoColors(paletteData.autoVars);
    }
  }, [paletteData]);

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

  if (!album) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-2">
            TrashFrame
          </h1>
          <p className="text-zinc-500 text-sm">
            Turn any Spotify album into a printable poster
          </p>
        </div>

        <form
          onSubmit={handleGenerate}
          className="w-full max-w-lg flex flex-col gap-3"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your Spotify album link"
              className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 shadow-sm transition"
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-40 shadow-sm transition"
            >
              {loading ? "Loading…" : "Generate"}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </form>
      </div>
    );
  }

  const currentLayout = customTheme
    ? "classic"
    : (PRESET_THEMES.find((p) => p.id === activePreset)?.layout || "classic");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-100">
        <button
          onClick={() => setAlbum(null)}
          className="text-base font-bold tracking-tight text-zinc-900 hover:opacity-70 transition"
        >
          TrashFrame
        </button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 p-4 lg:p-6 overflow-hidden">
        <div className="flex-1 flex items-start justify-center overflow-auto min-h-0">
          <div className="w-full max-w-[480px] relative">
            <PosterControls
              overrides={posterOverrides}
              onChange={handleOverridesChange}
            />
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
        />
      </div>
    </div>
  );
}
