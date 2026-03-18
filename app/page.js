"use client";

import { useState, useEffect, useCallback } from "react";
import Poster from "./components/Poster";
import Sidebar from "./components/Sidebar";
import PosterControls from "./components/PosterControls";
import CredentialsModal from "./components/CredentialsModal";
import { fetchAlbum } from "./lib/spotify";
import { extractDominantColors } from "./lib/colors";
import { DEFAULT_FRAME, PRESET_THEMES } from "./lib/constants";

function injectThemeCss(css) {
  let tag = document.getElementById("poster-theme");
  if (!tag) {
    tag = document.createElement("style");
    tag.id = "poster-theme";
    document.head.appendChild(tag);
  }
  tag.textContent = css || "";
}

function injectOverrideCss(css) {
  let tag = document.getElementById("poster-overrides");
  if (!tag) {
    tag = document.createElement("style");
    tag.id = "poster-overrides";
    document.head.appendChild(tag);
  }
  tag.textContent = css || "";
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
  const [credsOpen, setCredsOpen] = useState(false);
  const [hasCreds, setHasCreds] = useState(false);
  const [posterOverrides, setPosterOverrides] = useState(DEFAULT_OVERRIDES);
  const [albumColors, setAlbumColors] = useState(EMPTY_COLORS);

  useEffect(() => {
    if (!album?.coverUrl) { setAlbumColors(EMPTY_COLORS); return; }
    let cancelled = false;
    extractDominantColors(album.coverUrl)
      .then((c) => { if (!cancelled) setAlbumColors(c); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [album?.coverUrl]);

  useEffect(() => {
    const id = localStorage.getItem("spotify_client_id");
    const secret = localStorage.getItem("spotify_client_secret");
    setHasCreds(!!(id && secret));
    if (!id || !secret) setCredsOpen(true);

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
  }, []);

  const handleUploadTheme = useCallback((css) => {
    setCustomTheme(css);
    injectThemeCss(css);
    localStorage.setItem("poster_custom_css", css);
    localStorage.removeItem("poster_preset");
    loadGoogleFonts(extractFontsFromCss(css));
  }, []);

  const handleResetTheme = useCallback(() => {
    setCustomTheme(null);
    setActivePreset("default");
    injectThemeCss("");
    localStorage.removeItem("poster_custom_css");
    localStorage.setItem("poster_preset", "default");
  }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    if (!url.trim()) return;

    const id = localStorage.getItem("spotify_client_id");
    const secret = localStorage.getItem("spotify_client_secret");
    if (!id || !secret) {
      setCredsOpen(true);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await fetchAlbum(url.trim());
      setAlbum(data);
      setPosterOverrides(DEFAULT_OVERRIDES);
    } catch (err) {
      if (err.message === "MISSING_CREDENTIALS") {
        setCredsOpen(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleCredsClose() {
    setCredsOpen(false);
    const id = localStorage.getItem("spotify_client_id");
    const secret = localStorage.getItem("spotify_client_secret");
    setHasCreds(!!(id && secret));
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

        <button
          onClick={() => setCredsOpen(true)}
          className="mt-8 text-xs text-zinc-400 hover:text-zinc-600 transition"
          title="Spotify API settings"
        >
          {hasCreds ? "⚙ Update API Credentials" : "⚙ Set API Credentials"}
        </button>

        <CredentialsModal open={credsOpen} onClose={handleCredsClose} />
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCredsOpen(true)}
            className="text-xs text-zinc-400 hover:text-zinc-600 transition"
            title="Spotify API settings"
          >
            ⚙
          </button>
        </div>
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

      <CredentialsModal open={credsOpen} onClose={handleCredsClose} />
    </div>
  );
}
