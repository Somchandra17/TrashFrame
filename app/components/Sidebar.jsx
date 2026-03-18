"use client";

import { useState, useRef } from "react";
import { FRAME_SIZES, DEFAULT_THEME_CSS, PRESET_THEMES, AI_THEME_PROMPT } from "../lib/constants";
import { downloadPng, downloadPdf } from "../lib/export";

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
}) {
  const fileRef = useRef(null);
  const [exporting, setExporting] = useState(null);
  const [copied, setCopied] = useState(false);

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
      alert("Export failed \u2013 see console for details.");
    } finally {
      setExporting(null);
    }
  }

  const activeLabel = customTheme
    ? "AI theme"
    : PRESET_THEMES.find((p) => p.id === activePreset)?.name || "Classic";

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6 overflow-y-auto lg:max-h-[calc(100vh-5rem)] pr-1">
      {/* ── Poster ── */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
          Poster
        </h3>

        <p className="text-xs text-zinc-500 mb-1.5">Frame size</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(FRAME_SIZES).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setFrameSize(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                ${
                  frameSize === key
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="block mt-4">
          <span className="text-xs text-zinc-500">Quote / lyric</span>
          <input
            type="text"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="Add a lyric or quote\u2026"
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 transition"
          />
        </label>
      </section>

      {/* ── Theme ── */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
          Theme
        </h3>

        {/* Preset grid */}
        <p className="text-xs text-zinc-500 mb-1.5">Presets</p>
        <div className="grid grid-cols-3 gap-1.5 mb-4">
          {PRESET_THEMES.map((preset) => {
            const isActive = !customTheme && activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset.id)}
                className={`group relative flex flex-col items-center gap-1 rounded-lg p-2 transition-all
                  ${
                    isActive
                      ? "bg-zinc-900 ring-2 ring-zinc-900"
                      : "bg-zinc-50 hover:bg-zinc-100 ring-1 ring-zinc-200"
                  }`}
                title={preset.desc}
              >
                <div className="flex gap-0.5">
                  {preset.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10"
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

        {/* ── Style from an Image ── */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5 flex flex-col gap-3">
          <div>
            <p className="text-xs font-semibold text-zinc-700 mb-1">Style from an Image</p>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Find a poster you love on Pinterest, Instagram, or anywhere.
              Then use AI to match its style to your album poster.
            </p>
          </div>

          {/* Step 1 */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">Step 1</p>
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
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">Step 2</p>
            <div className="flex gap-1.5">
              <a
                href="https://chat.openai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition text-center"
              >
                Open ChatGPT <span className="opacity-50">&nearr;</span>
              </a>
              <a
                href="https://claude.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition text-center"
              >
                Open Claude <span className="opacity-50">&nearr;</span>
              </a>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed">
              Upload your inspiration image + paste the copied prompt. The AI will return a CSS file.
            </p>
          </div>

          {/* Step 3 */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">Step 3</p>
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

          {/* Status badge */}
          <div className="flex items-center gap-2">
            {customTheme ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                AI theme active
                <button
                  onClick={onResetTheme}
                  className="ml-0.5 text-emerald-500 hover:text-emerald-800 transition"
                  title="Reset to default"
                >
                  &times;
                </button>
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500">
                {activeLabel}
              </span>
            )}
          </div>

          {/* Divider + blank template fallback */}
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
        </div>
      </section>

      {/* ── Export ── */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
          Export
        </h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleExport("png")}
            disabled={!!exporting}
            className="w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 transition"
          >
            {exporting === "png" ? "Exporting\u2026" : "Download PNG"}
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={!!exporting}
            className="w-full rounded-lg border border-zinc-900 px-3 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 transition"
          >
            {exporting === "pdf" ? "Exporting\u2026" : "Download PDF"}
          </button>
        </div>
      </section>
    </aside>
  );
}
