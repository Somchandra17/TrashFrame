"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FRAME_SIZES, DEFAULT_THEME_CSS, PRESET_THEMES, AI_THEME_PROMPT } from "../lib/constants";
import { downloadPng, downloadPdf } from "../lib/export";

function Section({ icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="sidebar-section">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="sidebar-section-header"
      >
        <span className="sidebar-section-icon">{icon}</span>
        <span className="sidebar-section-title">{title}</span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          className={`sidebar-chevron ${open ? "sidebar-chevron-open" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="sidebar-section-body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SliderRow({ label, value, min, max, step, onChange, unit = "", displayValue }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="slider-row">
      <div className="slider-row-header">
        <span className="slider-label">{label}</span>
        <span className="slider-value">{displayValue ?? value}{unit}</span>
      </div>
      <div className="slider-track-wrapper">
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="slider-input"
          style={{ "--slider-pct": `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ToggleSwitch({ label, checked, onChange }) {
  const toggle = () => onChange(!checked);
  return (
    <div className="toggle-switch-row" onClick={toggle}>
      <span className="toggle-switch-label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={(e) => { e.stopPropagation(); toggle(); }}
        className={`toggle-switch ${checked ? "toggle-switch-on" : ""}`}
      >
        <motion.span
          className="toggle-switch-thumb"
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

function FrameSizePill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`frame-pill ${active ? "frame-pill-active" : ""}`}
    >
      {active && (
        <motion.span
          layoutId="framePill"
          className="frame-pill-bg"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="frame-pill-text">{label}</span>
    </button>
  );
}

const icons = {
  layout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  ),
  typography: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 7V4h16v3" />
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="8" y1="20" x2="16" y2="20" />
    </svg>
  ),
  themes: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" />
      <circle cx="8" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="10" r="1.5" fill="currentColor" />
      <circle cx="14" cy="14" r="1.5" fill="currentColor" />
    </svg>
  ),
  interactive: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  export: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  image: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  brush: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 114.03 4.03l-8.06 8.08" />
      <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 00-3-3.02z" />
    </svg>
  ),
};

export default function Sidebar({
  frameSize,
  setFrameSize,
  quote,
  setQuote,
  customTheme,
  activePreset,
  onSelectPreset,
  onUploadTheme,
  onResetTheme,
  itemName,
  overrides,
  onChangeOverrides,
  albumName,
  artistName,
  onGoBack,
  onNewUrl,
  urlValue,
  onUrlChange,
  urlLoading,
  urlError,
  coverUrl,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onHelpOpen,
  onExportingChange,
}) {
  const fileRef = useRef(null);
  const [exporting, setExporting] = useState(null);
  const [copied, setCopied] = useState(false);
  const [exportError, setExportError] = useState("");
  const [toast, setToast] = useState(null);
  const [exportDpi, setExportDpi] = useState(300);

  function setOverride(key, value) {
    onChangeOverrides({ ...overrides, [key]: value });
  }

  function handleDownloadTemplate() {
    const blob = new Blob([DEFAULT_THEME_CSS], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trashframe-theme.css";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUploadTheme(reader.result);
    reader.readAsText(file);
    e.target.value = "";
  }

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(AI_THEME_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = AI_THEME_PROMPT;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleExport(type) {
    setExporting(type);
    setExportError("");
    onExportingChange?.(true);
    try {
      if (type === "png") await downloadPng(frameSize, itemName, exportDpi);
      else await downloadPdf(frameSize, itemName, exportDpi);
      setToast(type === "png" ? "PNG downloaded!" : "PDF downloaded!");
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Export failed:", err);
      setExportError(err.message || "Export failed. Try again.");
    } finally {
      setExporting(null);
      onExportingChange?.(false);
    }
  }

  function handleResetOverrides() {
    onChangeOverrides({
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
    });
  }

  const activeLabel = customTheme
    ? "AI theme"
    : PRESET_THEMES.find((p) => p.id === activePreset)?.name || "Classic";

  return (
    <motion.aside
      className="sidebar"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
    >
      {/* Sidebar header */}
      <div className="sidebar-header">
        <div className="sidebar-header-top">
          <button onClick={onGoBack} className="sidebar-back-btn" title="Back to home">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="sidebar-header-logo">TrashFrame</span>
          <div className="sidebar-header-actions">
            <button onClick={onUndo} disabled={!canUndo} className="sidebar-icon-btn" title="Undo (Ctrl+Z)" aria-label="Undo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </button>
            <button onClick={onRedo} disabled={!canRedo} className="sidebar-icon-btn" title="Redo (Ctrl+Shift+Z)" aria-label="Redo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
              </svg>
            </button>
            <button onClick={onHelpOpen} className="sidebar-icon-btn" title="Help" aria-label="Help">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
          </div>
        </div>
        <div className="sidebar-header-info">
          {coverUrl && (
            <Image src={coverUrl} alt="" width={32} height={32} className="sidebar-header-thumb" unoptimized />
          )}
          <span className="sidebar-header-album">{albumName || itemName}{artistName ? ` - ${artistName}` : ""}</span>
        </div>
        <form onSubmit={onNewUrl} className="sidebar-url-form">
          <input
            type="text"
            value={urlValue}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="Paste a new Spotify link\u2026"
            className="sidebar-url-input"
          />
          <button type="submit" disabled={urlLoading || !urlValue?.trim()} className="sidebar-url-btn">
            {urlLoading ? "\u2026" : "Go"}
          </button>
        </form>
        {urlError && <p className="sidebar-url-error">{urlError}</p>}
      </div>

      <div className="sidebar-scroll">
        {/* ── 1. LAYOUT & SIZING ── */}
        <Section icon={icons.layout} title="Layout & Sizing" defaultOpen={true}>
          <div className="frame-pills-row">
            {Object.entries(FRAME_SIZES).map(([key, { label }]) => (
              <FrameSizePill
                key={key}
                label={label}
                active={frameSize === key}
                onClick={() => setFrameSize(key)}
              />
            ))}
          </div>

          <SliderRow
            label="Cover Zoom"
            value={overrides.artZoom ?? 1.0}
            min={0.5} max={2.0} step={0.05}
            onChange={(v) => setOverride("artZoom", v)}
            displayValue={(overrides.artZoom ?? 1.0).toFixed(2)} unit="x"
          />
        </Section>

        {/* ── 2. TYPOGRAPHY ── */}
        <Section icon={icons.typography} title="Typography" defaultOpen={false}>
          <div className="sidebar-field">
            <span className="sidebar-field-label">Quote / Lyric</span>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Add a lyric or quote\u2026"
              className="sidebar-textarea"
            />
          </div>

          <div className="sidebar-field">
            <div className="sidebar-field-row">
              <span className="sidebar-field-label">Quote Font</span>
              <select
                value={overrides.quoteFont || ""}
                onChange={(e) => setOverride("quoteFont", e.target.value)}
                className="sidebar-select"
              >
                <option value="">Theme Default</option>
                <option value="Dancing Script">Dancing Script</option>
                <option value="Pacifico">Pacifico</option>
                <option value="Inter">Inter</option>
                <option value="Space Mono">Space Mono</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Caveat">Caveat</option>
              </select>
            </div>
          </div>

          <SliderRow
            label="Title Scale"
            value={overrides.titleFontScale || 1.0}
            min={0.6} max={2.5} step={0.05}
            onChange={(v) => setOverride("titleFontScale", v)}
            displayValue={(overrides.titleFontScale || 1.0).toFixed(2)} unit="x"
          />
          <SliderRow
            label="Tracklist Scale"
            value={overrides.tracklistFontScale || 1.0}
            min={0.6} max={2.0} step={0.05}
            onChange={(v) => setOverride("tracklistFontScale", v)}
            displayValue={(overrides.tracklistFontScale || 1.0).toFixed(2)} unit="x"
          />

          <div className="sidebar-field">
            <span className="sidebar-field-label">Font Color</span>
            <div className="color-swatches">
              {[
                { label: "Auto", value: null },
                { label: "White", value: "#ffffff" },
                { label: "Black", value: "#111111" },
                { label: "Cream", value: "#f5f0e6" },
                { label: "Gold", value: "#c9a962" },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setOverride("fontColor", opt.value)}
                  className={`color-swatch-btn ${overrides.fontColor === opt.value ? "color-swatch-active" : ""}`}
                  title={opt.label}
                >
                  {opt.value ? (
                    <span className="color-swatch-dot" style={{ backgroundColor: opt.value }} />
                  ) : (
                    <span className="color-swatch-auto">A</span>
                  )}
                </button>
              ))}
              <div className={`color-swatch-custom ${overrides.fontColor && ![null, "#ffffff", "#111111", "#f5f0e6", "#c9a962"].includes(overrides.fontColor) ? "color-swatch-custom-active" : ""}`}>
                <input
                  type="color"
                  value={overrides.fontColor || "#111111"}
                  onChange={(e) => setOverride("fontColor", e.target.value)}
                  className="color-input"
                />
              </div>
            </div>
          </div>

          <div className="sidebar-field">
            <span className="sidebar-field-label">Background Color</span>
            <div className="color-swatches">
              {[
                { label: "Auto", value: null },
                { label: "White", value: "#ffffff" },
                { label: "Black", value: "#111111" },
                { label: "Cream", value: "#f5f0e6" },
                { label: "Warm Gray", value: "#e8e4df" },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setOverride("bgColor", opt.value)}
                  className={`color-swatch-btn ${overrides.bgColor === opt.value ? "color-swatch-active" : ""}`}
                  title={opt.label}
                >
                  {opt.value ? (
                    <span className="color-swatch-dot" style={{ backgroundColor: opt.value }} />
                  ) : (
                    <span className="color-swatch-auto">A</span>
                  )}
                </button>
              ))}
              <div className={`color-swatch-custom ${overrides.bgColor && ![null, "#ffffff", "#111111", "#f5f0e6", "#e8e4df"].includes(overrides.bgColor) ? "color-swatch-custom-active" : ""}`}>
                <input
                  type="color"
                  value={overrides.bgColor || "#ffffff"}
                  onChange={(e) => setOverride("bgColor", e.target.value)}
                  className="color-input"
                />
              </div>
            </div>
          </div>

          <button onClick={handleResetOverrides} className="sidebar-reset-btn">
            Reset All Overrides
          </button>
        </Section>

        {/* ── 3. DYNAMIC THEME PRESETS ── */}
        <Section icon={icons.themes} title="Dynamic Theme Presets" defaultOpen={true}>
          <div className="theme-grid">
            {PRESET_THEMES.map((preset) => {
              const isActive = !customTheme && activePreset === preset.id;
              return (
                <motion.button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset.id)}
                  className={`theme-card ${isActive ? "theme-card-active" : ""}`}
                  title={preset.desc}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="theme-card-colors">
                    {preset.colors.map((c, i) => (
                      <span
                        key={i}
                        className="theme-card-dot"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <span className={`theme-card-name ${isActive ? "theme-card-name-active" : ""}`}>
                    {preset.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </Section>

        {/* ── 4. INTERACTIVE ELEMENTS ── */}
        <Section icon={icons.interactive} title="Interactive Elements" defaultOpen={true}>
          <div className="interactive-toggles">
            <ToggleSwitch
              label="Date"
              checked={!overrides.hideDate}
              onChange={(checked) => setOverride("hideDate", !checked)}
            />
            <ToggleSwitch
              label="Artists"
              checked={!overrides.hideArtist}
              onChange={(checked) => setOverride("hideArtist", !checked)}
            />
            <div className="sidebar-field">
              <span className="sidebar-field-label">Bottom Code</span>
              <div className="cover-toggles">
                <button
                  onClick={() => setOverride("codeType", "qr")}
                  className={`cover-mode-btn ${overrides.codeType === "qr" ? "cover-mode-active" : ""}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 4, display: "inline-block", verticalAlign: "-2px" }}>
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                  QR Code
                </button>
                <button
                  onClick={() => setOverride("codeType", "scannable")}
                  className={`cover-mode-btn ${overrides.codeType === "scannable" ? "cover-mode-active" : ""}`}
                >
                  Spotify Code
                </button>
              </div>
            </div>
            <div className="sidebar-field">
              <span className="sidebar-field-label">Code Color</span>
              <div className="color-swatches">
                {[
                  { label: "Auto", value: null },
                  { label: "Black", value: "#000000" },
                  { label: "White", value: "#ffffff" },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setOverride("codeColor", opt.value)}
                    className={`color-swatch-btn ${overrides.codeColor === opt.value ? "color-swatch-active" : ""}`}
                    title={opt.label}
                  >
                    {opt.value ? (
                      <span className="color-swatch-dot" style={{ backgroundColor: opt.value }} />
                    ) : (
                      <span className="color-swatch-auto">A</span>
                    )}
                  </button>
                ))}
                <div className={`color-swatch-custom ${overrides.codeColor && ![null, "#000000", "#ffffff"].includes(overrides.codeColor) ? "color-swatch-custom-active" : ""}`}>
                  <input
                    type="color"
                    value={overrides.codeColor || "#111111"}
                    onChange={(e) => setOverride("codeColor", e.target.value)}
                    className="color-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 5. COVER ART ── */}
        <Section icon={icons.image} title="Cover Art" defaultOpen={false}>
          <div className="cover-toggles">
            <button
              onClick={() => setOverride("colorCover", false)}
              className={`cover-mode-btn ${!overrides.colorCover ? "cover-mode-active" : ""}`}
            >
              B&W
            </button>
            <button
              onClick={() => setOverride("colorCover", true)}
              className={`cover-mode-btn ${overrides.colorCover ? "cover-mode-active" : ""}`}
            >
              Color
            </button>
          </div>
          <SliderRow
            label="Ghost Watermark"
            value={overrides.ghostOpacity ?? 0}
            min={0} max={0.15} step={0.01}
            onChange={(v) => setOverride("ghostOpacity", v)}
            displayValue={Math.round((overrides.ghostOpacity ?? 0) * 100)} unit="%"
          />
          <SliderRow
            label="Horizontal Position" value={overrides.artPosX ?? 50}
            min={0} max={100} step={1}
            onChange={(v) => setOverride("artPosX", v)}
            unit="%"
          />
          <SliderRow
            label="Vertical Position" value={overrides.artPosY ?? 50}
            min={0} max={100} step={1}
            onChange={(v) => setOverride("artPosY", v)}
            unit="%"
          />
          <SliderRow
            label="Brightness" value={overrides.artBrightness ?? 100}
            min={30} max={200} step={5}
            onChange={(v) => setOverride("artBrightness", v)}
            unit="%"
          />
          <SliderRow
            label="Contrast" value={overrides.artContrast ?? 100}
            min={30} max={200} step={5}
            onChange={(v) => setOverride("artContrast", v)}
            unit="%"
          />
          <div className="sidebar-row-split">
            <button
              onClick={() => setOverride("gradientBg", !overrides.gradientBg)}
              className={`cover-mode-btn ${overrides.gradientBg ? "cover-mode-active" : ""}`}
            >
              {overrides.gradientBg ? "Gradient On" : "Solid BG"}
            </button>
            <button
              onClick={() => {
                onChangeOverrides({
                  ...overrides,
                  artZoom: 1.0,
                  artPosX: 50,
                  artPosY: 50,
                  artBrightness: 100,
                  artContrast: 100,
                });
              }}
              className="sidebar-reset-btn"
            >
              Reset Art
            </button>
          </div>
        </Section>

        {/* ── 6. AI THEME BUILDER ── */}
        <Section icon={icons.brush} title="AI Theme Builder" defaultOpen={false}>
          <div className="ai-theme-intro">
            <p className="ai-theme-intro-title">How it works</p>
            <p className="ai-theme-intro-desc">
              Found a poster aesthetic you love? Use any AI chatbot to
              automatically generate a matching CSS theme. Just 3 steps.
            </p>
          </div>

          <div className="ai-step">
            <span className="ai-step-num">1</span>
            <span className="ai-step-text">Copy the theme prompt</span>
          </div>
          <button onClick={handleCopyPrompt} className={`ai-copy-btn ${copied ? "ai-copy-btn-done" : ""}`}>
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                Copy AI Prompt
              </>
            )}
          </button>

          <div className="ai-step">
            <span className="ai-step-num">2</span>
            <span className="ai-step-text">Paste into any AI + upload inspo</span>
          </div>
          <div className="ai-links">
            <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer" className="ai-link-btn">ChatGPT &#8599;</a>
            <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="ai-link-btn">Claude &#8599;</a>
            <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" className="ai-link-btn">Gemini &#8599;</a>
          </div>

          <div className="ai-step">
            <span className="ai-step-num">3</span>
            <span className="ai-step-text">Upload the generated CSS here</span>
          </div>
          <button onClick={() => fileRef.current?.click()} className="ai-upload-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            Upload .css file
          </button>
          <input ref={fileRef} type="file" accept=".css" className="hidden" onChange={handleFileUpload} />

          {customTheme ? (
            <div className="ai-status ai-status-active">
              <span className="ai-status-dot" />
              AI theme active
              <button onClick={onResetTheme} className="ai-status-remove">&times;</button>
            </div>
          ) : (
            <div className="ai-status">
              Using: {activeLabel}
            </div>
          )}

          <div className="ai-divider">
            <span className="ai-divider-line" />
            <span className="ai-divider-text">or start from scratch</span>
            <span className="ai-divider-line" />
          </div>
          <button onClick={handleDownloadTemplate} className="ai-template-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Download blank CSS template
          </button>
        </Section>

        {/* ── 7. EXPORT ── */}
        <Section icon={icons.export} title="Export" defaultOpen={true}>
          <div className="sidebar-field">
            <span className="sidebar-field-label">Quality (DPI)</span>
            <div className="cover-toggles">
              {[
                { dpi: 150, label: "150 Draft" },
                { dpi: 300, label: "300 Print" },
                { dpi: 600, label: "600 Ultra" },
              ].map(({ dpi, label }) => (
                <button
                  key={dpi}
                  onClick={() => setExportDpi(dpi)}
                  className={`cover-mode-btn ${exportDpi === dpi ? "cover-mode-active" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="export-buttons">
            <motion.button
              onClick={() => handleExport("png")}
              disabled={!!exporting}
              className="export-btn export-btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {exporting === "png" ? "Exporting\u2026" : "Download PNG"}
            </motion.button>
            <motion.button
              onClick={() => handleExport("pdf")}
              disabled={!!exporting}
              className="export-btn export-btn-secondary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {exporting === "pdf" ? "Exporting\u2026" : "Download PDF"}
            </motion.button>
          </div>
          {exportError && <p className="export-error">{exportError}</p>}
        </Section>
      </div>
      <AnimatePresence>
        {toast && (
          <motion.div
            key="export-toast"
            className="export-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
