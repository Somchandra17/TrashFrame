"use client";

import { useState, useRef, useEffect } from "react";

export default function PosterControls({ overrides, onChange }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function set(key, value) {
    onChange({ ...overrides, [key]: value });
  }

  return (
    <div className="absolute top-2 right-2 z-30" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all shadow-sm
          ${open
            ? "bg-zinc-900 text-white"
            : "bg-white/80 backdrop-blur text-zinc-600 hover:bg-white hover:text-zinc-900 ring-1 ring-zinc-200"
          }`}
        title="Customize poster"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-10 right-0 w-56 bg-white rounded-xl shadow-xl ring-1 ring-zinc-200 p-3 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-150">

          {/* Font Scale */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Font Size</span>
              <span className="text-[10px] font-mono text-zinc-500">{overrides.fontScale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.6"
              step="0.05"
              value={overrides.fontScale}
              onChange={(e) => set("fontScale", parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-zinc-900"
            />
          </div>

          {/* Album Art */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">Album Art</span>
            <div className="flex rounded-lg overflow-hidden ring-1 ring-zinc-200">
              <button
                onClick={() => set("colorCover", false)}
                className={`flex-1 py-1.5 text-[11px] font-medium transition-colors
                  ${!overrides.colorCover ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 hover:bg-zinc-50"}`}
              >
                B&W
              </button>
              <button
                onClick={() => set("colorCover", true)}
                className={`flex-1 py-1.5 text-[11px] font-medium transition-colors
                  ${overrides.colorCover ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 hover:bg-zinc-50"}`}
              >
                Color
              </button>
            </div>
          </div>

          {/* Background */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">Background</span>
            <div className="flex rounded-lg overflow-hidden ring-1 ring-zinc-200">
              <button
                onClick={() => set("gradientBg", false)}
                className={`flex-1 py-1.5 text-[11px] font-medium transition-colors
                  ${!overrides.gradientBg ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 hover:bg-zinc-50"}`}
              >
                Solid
              </button>
              <button
                onClick={() => set("gradientBg", true)}
                className={`flex-1 py-1.5 text-[11px] font-medium transition-colors
                  ${overrides.gradientBg ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 hover:bg-zinc-50"}`}
              >
                Gradient
              </button>
            </div>
          </div>

          {/* Ghost Watermark */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">Ghost Watermark</span>
            <div className="flex rounded-lg overflow-hidden ring-1 ring-zinc-200">
              <button
                onClick={() => set("ghostOpacity", 0)}
                className={`flex-1 py-1.5 text-[11px] font-medium transition-colors
                  ${(!overrides.ghostOpacity || overrides.ghostOpacity === 0) ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 hover:bg-zinc-50"}`}
              >
                Off
              </button>
              <button
                onClick={() => set("ghostOpacity", 0.06)}
                className={`flex-1 py-1.5 text-[11px] font-medium transition-colors
                  ${overrides.ghostOpacity > 0 ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 hover:bg-zinc-50"}`}
              >
                Subtle
              </button>
            </div>
          </div>

          {/* Bottom Code */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">Bottom Code</span>
            <div className="flex rounded-lg overflow-hidden ring-1 ring-zinc-200">
              <button
                onClick={() => set("codeType", "qr")}
                className={`flex-1 py-1.5 text-[11px] font-medium transition-colors
                  ${overrides.codeType === "qr" ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 hover:bg-zinc-50"}`}
              >
                QR Code
              </button>
              <button
                onClick={() => set("codeType", "scannable")}
                className={`flex-1 py-1.5 text-[11px] font-medium transition-colors
                  ${overrides.codeType === "scannable" ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 hover:bg-zinc-50"}`}
              >
                Spotify Code
              </button>
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={() => onChange({ fontScale: 1.0, colorCover: false, gradientBg: false, codeType: "qr", gradientColors: null, ghostOpacity: 0 })}
            className="text-[10px] text-zinc-400 hover:text-zinc-600 transition self-center mt-0.5"
          >
            Reset all
          </button>
        </div>
      )}
    </div>
  );
}
