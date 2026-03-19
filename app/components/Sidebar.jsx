"use client";

import { useState, useRef } from "react";
import { FRAME_SIZES, DEFAULT_THEME_CSS, PRESET_THEMES, AI_THEME_PROMPT } from "../lib/constants";
import { downloadPng, downloadPdf } from "../lib/export";

/* ═══════════════ Accordion Section ═══════════════ */
function Section({ icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-3 text-left group"
      >
        <span className="text-zinc-400 group-hover:text-zinc-600 transition">{icon}</span>
        <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-700 transition">
          {title}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={`text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="pb-4 flex flex-col gap-3">{children}</div>}
    </div>
  );
}

/* ═══════════════ Slider Row ═══════════════ */
function SliderRow({ label, value, min, max, step, onChange, unit = "", displayValue }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-zinc-500">{label}</span>
        <span className="text-[10px] font-mono text-zinc-400">{displayValue ?? value}{unit}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-zinc-900"
      />
    </div>
  );
}

/* ═══════════════ Toggle Pair ═══════════════ */
function TogglePair({ labelA, labelB, isB, onToggle }) {
  return (
    <div className="flex rounded-lg overflow-hidden ring-1 ring-zinc-200">
      <button
        onClick={() => onToggle(false)}
        className={`flex-1 py-1.5 text-[11px] font-medium transition-colors
          ${!isB ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 hover:bg-zinc-50"}`}
      >
        {labelA}
      </button>
      <button
        onClick={() => onToggle(true)}
        className={`flex-1 py-1.5 text-[11px] font-medium transition-colors
          ${isB ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 hover:bg-zinc-50"}`}
      >
        {labelB}
      </button>
    </div>
  );
}

/* ═══════════════ Icons ═══════════════ */
const icons = {
  frame: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><rect x="7" y="7" width="10" height="10" rx="1" /></svg>,
  palette: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="8" r="1.5" fill="currentColor" /><circle cx="8" cy="12" r="1.5" fill="currentColor" /><circle cx="15.5" cy="10" r="1.5" fill="currentColor" /><circle cx="14" cy="14" r="1.5" fill="currentColor" /></svg>,
  image: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>,
  type: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7V4h16v3" /><line x1="12" y1="4" x2="12" y2="20" /><line x1="8" y1="20" x2="16" y2="20" /></svg>,
  brush: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 114.03 4.03l-8.06 8.08" /><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 00-3-3.02z" /></svg>,
  download: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
};

/* ═══════════════ MAIN SIDEBAR ═══════════════ */
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
  albumName,
  overrides,
  onChangeOverrides,
}) {
  const fileRef = useRef(null);
  const [exporting, setExporting] = useState(null);
  const [copied, setCopied] = useState(false);

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
    try {
      if (type === "png") await downloadPng(frameSize, albumName);
      else await downloadPdf(frameSize, albumName);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed – see console for details.");
    } finally {
      setExporting(null);
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
    <aside className="w-full lg:w-[340px] flex-shrink-0 flex flex-col overflow-y-auto lg:max-h-[calc(100vh-6rem)] px-5 py-2 bg-white/80 backdrop-blur-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl mx-auto lg:mx-0 z-10 transition-all custom-scrollbar">

      {/* ───────── 1. FRAME & LAYOUT ───────── */}
      <Section icon={icons.frame} title="Frame & Layout" defaultOpen={true}>
        <div>
          <span className="text-[11px] text-zinc-500 block mb-1.5">Frame Size</span>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(FRAME_SIZES).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setFrameSize(key)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors
                  ${frameSize === key
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[11px] text-zinc-500 block mb-1.5">Quote / Lyric</span>
          <textarea
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="Add a lyric or quote…"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 transition resize-none h-16"
          />
        </div>

        <div>
          <span className="text-[11px] text-zinc-500 block mb-1">Quote Font</span>
          <select
            value={overrides.quoteFont || ""}
            onChange={(e) => setOverride("quoteFont", e.target.value)}
            className="w-full text-xs rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-300 transition"
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

        <div>
          <span className="text-[11px] text-zinc-500 block mb-1.5">Show / Hide</span>
          <div className="flex gap-2">
            <label className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium text-zinc-600 cursor-pointer bg-zinc-50 rounded-lg py-1.5 hover:bg-zinc-100 transition">
              <input
                type="checkbox"
                checked={!overrides.hideDate}
                onChange={(e) => setOverride("hideDate", !e.target.checked)}
                className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              />
              Timestamp
            </label>
            <label className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium text-zinc-600 cursor-pointer bg-zinc-50 rounded-lg py-1.5 hover:bg-zinc-100 transition">
              <input
                type="checkbox"
                checked={!overrides.hideArtist}
                onChange={(e) => setOverride("hideArtist", !e.target.checked)}
                className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              />
              Artists
            </label>
          </div>
        </div>

        <TogglePair
          labelA="QR Code"
          labelB="Spotify Code"
          isB={overrides.codeType === "scannable"}
          onToggle={(isB) => setOverride("codeType", isB ? "scannable" : "qr")}
        />
      </Section>

      {/* ───────── 2. ALBUM ART ───────── */}
      <Section icon={icons.image} title="Album Art" defaultOpen={false}>
        <TogglePair
          labelA="B&W"
          labelB="Color"
          isB={overrides.colorCover}
          onToggle={(isB) => setOverride("colorCover", isB)}
        />
        <SliderRow
          label="Zoom" value={overrides.artZoom ?? 1.0}
          min={0.5} max={2.0} step={0.05}
          onChange={(v) => setOverride("artZoom", v)}
          displayValue={(overrides.artZoom ?? 1.0).toFixed(2)} unit="x"
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
        <button
          onClick={() => {
            setOverride("artZoom", 1.0);
            setOverride("artPosX", 50);
            setOverride("artPosY", 50);
            setOverride("artBrightness", 100);
            setOverride("artContrast", 100);
          }}
          className="text-[10px] text-zinc-400 hover:text-zinc-600 transition self-end"
        >
          Reset Art
        </button>
      </Section>

      {/* ───────── 3. TYPOGRAPHY & COLOR ───────── */}
      <Section icon={icons.type} title="Typography & Color" defaultOpen={false}>
        <SliderRow
          label="Title Scale" value={overrides.titleFontScale || 1.0}
          min={0.6} max={2.5} step={0.05}
          onChange={(v) => setOverride("titleFontScale", v)}
          displayValue={(overrides.titleFontScale || 1.0).toFixed(2)} unit="x"
        />
        <SliderRow
          label="Tracklist Scale" value={overrides.tracklistFontScale || 1.0}
          min={0.6} max={2.0} step={0.05}
          onChange={(v) => setOverride("tracklistFontScale", v)}
          displayValue={(overrides.tracklistFontScale || 1.0).toFixed(2)} unit="x"
        />
        <div>
          <span className="text-[11px] text-zinc-500 block mb-1">Font Color</span>
          <div className="flex gap-1.5 flex-wrap">
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
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors flex items-center gap-1
                  ${overrides.fontColor === opt.value
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
              >
                {opt.value && (
                  <span
                    className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: opt.value }}
                  />
                )}
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="color"
              value={overrides.fontColor || "#111111"}
              onChange={(e) => setOverride("fontColor", e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 p-0"
            />
            <span className="text-[10px] text-zinc-400">Custom color</span>
          </div>
        </div>

        <TogglePair
          labelA="Solid Background"
          labelB="Gradient"
          isB={overrides.gradientBg}
          onToggle={(isB) => setOverride("gradientBg", isB)}
        />

        <button
          onClick={handleResetOverrides}
          className="text-[10px] text-zinc-400 hover:text-zinc-600 transition self-end"
        >
          Reset All Overrides
        </button>
      </Section>

      {/* ───────── 4. THEME PRESETS ───────── */}
      <Section icon={icons.palette} title="Theme Presets" defaultOpen={true}>
        <div className="grid grid-cols-3 gap-1.5">
          {PRESET_THEMES.map((preset) => {
            const isActive = !customTheme && activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.id)}
                className={`group relative flex flex-col items-center gap-1 rounded-lg p-2 transition-all
                  ${isActive
                    ? "bg-zinc-900 ring-2 ring-zinc-900"
                    : "bg-zinc-50 hover:bg-zinc-100 ring-1 ring-zinc-200"
                  }`}
                title={preset.desc}
              >
                <div className="flex gap-0.5">
                  {preset.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-3 h-3 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <span
                  className={`text-[10px] font-medium leading-tight text-center
                    ${isActive ? "text-white" : "text-zinc-600"}`}
                >
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* ───────── 5. AI THEME BUILDER ───────── */}
      <Section icon={icons.brush} title="AI Theme Builder" defaultOpen={false}>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Find a poster you love on Pinterest or Instagram, then use AI to generate a matching CSS theme.
        </p>

        {/* Step 1 */}
        <div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 block mb-1">Step 1 — Copy prompt</span>
          <button
            onClick={handleCopyPrompt}
            className={`w-full rounded-lg px-3 py-2 text-sm font-medium transition-all flex items-center justify-center gap-1.5
              ${copied
                ? "bg-emerald-600 text-white"
                : "bg-zinc-900 text-white hover:bg-zinc-800"
              }`}
          >
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
        </div>

        {/* Step 2 */}
        <div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 block mb-1">Step 2 — Paste into AI</span>
          <div className="flex gap-1.5">
            <a
              href="https://chat.openai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition text-center"
            >
              ChatGPT ↗
            </a>
            <a
              href="https://claude.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition text-center"
            >
              Claude ↗
            </a>
          </div>
        </div>

        {/* Step 3 */}
        <div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 block mb-1">Step 3 — Upload CSS</span>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-lg border border-dashed border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 transition flex items-center justify-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            Upload CSS from AI
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".css"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          {customTheme ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              AI theme active
              <button
                onClick={onResetTheme}
                className="ml-0.5 text-emerald-500 hover:text-emerald-800 transition"
                title="Reset to default"
              >
                ×
              </button>
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500">
              {activeLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <span className="flex-1 h-px bg-zinc-200" />
          <span className="text-[10px] text-zinc-400">or</span>
          <span className="flex-1 h-px bg-zinc-200" />
        </div>
        <button
          onClick={handleDownloadTemplate}
          className="text-[11px] text-zinc-400 hover:text-zinc-600 transition text-center"
        >
          Download blank template CSS
        </button>
      </Section>

      {/* ───────── 6. EXPORT ───────── */}
      <Section icon={icons.download} title="Export" defaultOpen={true}>
        <button
          onClick={() => handleExport("png")}
          disabled={!!exporting}
          className="w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 transition"
        >
          {exporting === "png" ? "Exporting…" : "Download PNG"}
        </button>
        <button
          onClick={() => handleExport("pdf")}
          disabled={!!exporting}
          className="w-full rounded-lg border border-zinc-900 px-3 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 transition"
        >
          {exporting === "pdf" ? "Exporting…" : "Download PDF"}
        </button>
      </Section>
    </aside>
  );
}
