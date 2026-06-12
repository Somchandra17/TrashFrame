"use client";

/*
 * Miniature layout mockups for the theme preset grid.
 * Pure CSS blocks tinted with each preset's palette triple [bg, fg, accent] —
 * structural classes live in globals.css (.theme-thumb / .tt-*), colors are
 * inline because they come from PRESET_THEMES data.
 * Everything is <span> so the whole thumb is valid inside the picker <button>.
 */

function coverFill(fg, accent) {
  return `linear-gradient(135deg, ${accent} 0%, ${fg} 100%)`;
}

function Line({ w = "60%", color, o = 1, h = 2, style }) {
  return (
    <span
      className="tt-line"
      style={{ width: w, background: color, opacity: o, height: h, ...style }}
    />
  );
}

function Lines({ n = 3, color, o = 0.4, w = "100%", gap = 2, style }) {
  return (
    <span className="tt-lines" style={{ gap, ...style }}>
      {Array.from({ length: n }).map((_, i) => (
        <Line key={i} color={color} o={o} w={i % 2 ? "70%" : w} />
      ))}
    </span>
  );
}

function Cover({ fg, accent, style }) {
  return <span className="tt-cover" style={{ background: coverFill(fg, accent), ...style }} />;
}

function Dot({ color, style }) {
  return <span className="tt-dot" style={{ background: color, ...style }} />;
}

function Swatches({ colors, style }) {
  return (
    <span className="tt-swatches" style={style}>
      {colors.map((c, i) => (
        <span key={i} className="tt-swatch" style={{ background: c }} />
      ))}
    </span>
  );
}

const THUMBS = {
  classic: ({ fg, accent }) => (
    <>
      <Line color={fg} w="24%" o={0.4} style={{ alignSelf: "flex-end" }} />
      <Cover fg={fg} accent={accent} style={{ height: "42%" }} />
      <Line color={fg} w="58%" h={3} />
      <Line color={fg} w="34%" o={0.5} />
      <span className="tt-row">
        <Lines color={fg} n={3} />
        <Lines color={fg} n={3} />
        <Dot color={fg} />
      </span>
    </>
  ),

  gallery: ({ fg, accent }) => (
    <>
      <Line color={fg} w="52%" h={3} style={{ alignSelf: "center" }} />
      <Cover fg={fg} accent={accent} style={{ height: "46%" }} />
      <span className="tt-row" style={{ alignItems: "flex-start" }}>
        <Lines color={fg} n={4} style={{ flex: 1 }} />
        <span style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
          <Swatches colors={[accent, fg, accent]} />
          <Dot color={fg} style={{ marginTop: 2 }} />
        </span>
      </span>
    </>
  ),

  overlay: ({ bg, fg, accent }) => (
    <>
      <span className="tt-bleed" style={{ background: coverFill(fg, accent), opacity: 0.85 }} />
      <span className="tt-plate" style={{ background: `${bg}d9`, height: "72%", margin: "auto 4% 4%" }}>
        <Line color={fg} w="36%" o={0.6} />
        <Line color={fg} w="62%" h={3} />
        <Lines color={fg} n={4} style={{ marginTop: 2 }} />
        <Dot color={fg} style={{ marginTop: "auto" }} />
      </span>
    </>
  ),

  editorial: ({ fg, accent }) => (
    <>
      <Line color={fg} w="28%" o={0.5} />
      <Line color={fg} w="84%" h={5} />
      <Cover fg={fg} accent={accent} style={{ height: "44%", marginTop: 2 }} />
      <span className="tt-row" style={{ gap: 3 }}>
        {[0, 1, 2, 3].map((i) => (
          <Lines key={i} color={fg} n={2} o={0.45} style={{ flex: 1 }} />
        ))}
        <Dot color={fg} />
      </span>
    </>
  ),

  "bold-block": ({ fg, accent }) => (
    <>
      <span className="tt-bleed" style={{ boxShadow: `inset 0 0 0 2px ${fg}` }} />
      <Line color={fg} w="72%" h={5} style={{ marginTop: 2 }} />
      <Line color={fg} w="38%" o={0.55} />
      <span style={{ display: "flex", gap: 3, height: "40%" }}>
        <Cover fg={fg} accent={accent} style={{ flex: 1, height: "100%" }} />
        <span className="tt-line" style={{ width: 5, height: "100%", background: accent }} />
      </span>
      <span className="tt-row">
        <Lines color={fg} n={3} />
        <Lines color={fg} n={3} />
        <Dot color={fg} />
      </span>
    </>
  ),

  minimal: ({ fg, accent }) => (
    <>
      <span className="tt-row" style={{ marginTop: 0, alignItems: "flex-start" }}>
        <Line color={fg} w="20%" o={0.4} />
        <Line color={fg} w="16%" o={0.4} style={{ marginLeft: "auto" }} />
      </span>
      <span style={{ display: "flex", gap: 4, flex: 1, alignItems: "center" }}>
        <span className="tt-lines" style={{ gap: 3, flex: 1 }}>
          <Line color={fg} w="86%" h={4} />
          <Line color={fg} w="52%" o={0.5} />
        </span>
        <Cover fg={fg} accent={accent} style={{ width: "42%", height: "58%", borderRadius: "999px 999px 0 0" }} />
      </span>
      <Line color={fg} w="92%" o={0.4} />
      <span className="tt-row">
        <Line color={fg} w="40%" o={0.35} />
        <Dot color={fg} style={{ marginLeft: "auto" }} />
      </span>
    </>
  ),

  immersive: ({ bg, fg, accent }) => (
    <>
      <span className="tt-bleed" style={{ background: coverFill(fg, accent) }} />
      <span
        className="tt-bleed"
        style={{ background: `linear-gradient(180deg, transparent 30%, ${bg} 100%)` }}
      />
      <Line color={fg} w="68%" h={4} style={{ margin: "26% auto 0", position: "relative" }} />
      <span className="tt-lines" style={{ gap: 2, marginTop: "auto", position: "relative" }}>
        <Line color={fg} w="92%" o={0.55} />
        <Line color={fg} w="74%" o={0.55} />
      </span>
      <span className="tt-row" style={{ position: "relative" }}>
        <Line color={fg} w="36%" o={0.4} />
        <Dot color={fg} style={{ marginLeft: "auto" }} />
      </span>
    </>
  ),

  retro: ({ fg, accent }) => (
    <>
      <Line color={accent} w="30%" o={0.9} style={{ alignSelf: "center" }} />
      <Line color={fg} w="64%" h={4} style={{ alignSelf: "center" }} />
      <span style={{ display: "flex", gap: 3, height: "44%" }}>
        <Cover fg={fg} accent={accent} style={{ flex: 1.2, height: "100%" }} />
        <span className="tt-panel" style={{ flex: 1, boxShadow: `inset 0 0 0 1px ${fg}55` }}>
          <Line color={fg} w="60%" o={0.6} />
          <Lines color={fg} n={4} />
        </span>
      </span>
      <span className="tt-row">
        <Line color={accent} w="30%" o={0.8} />
        <Dot color={fg} style={{ marginLeft: "auto" }} />
      </span>
    </>
  ),

  "masterpiece-jcard": ({ fg, accent }) => (
    <span style={{ display: "flex", gap: 3, flex: 1 }}>
      <span className="tt-panel" style={{ width: "16%", boxShadow: `inset 0 0 0 1px ${fg}44`, alignItems: "center", justifyContent: "space-between", padding: "8% 2%" }}>
        <Dot color={fg} style={{ width: 4, height: 4 }} />
        <span className="tt-line" style={{ width: 2, height: "52%", background: fg, opacity: 0.5 }} />
      </span>
      <Cover fg={fg} accent={accent} style={{ flex: 1.2, height: "100%" }} />
      <span className="tt-panel" style={{ flex: 1, boxShadow: `inset 0 0 0 1px ${fg}44` }}>
        <Line color={fg} w="70%" h={3} />
        <Lines color={fg} n={5} />
      </span>
    </span>
  ),

  "masterpiece-comic": ({ bg, fg, accent }) => (
    <>
      <Line color={accent} w="78%" h={5} style={{ alignSelf: "center" }} />
      <Line color={fg} w="40%" o={0.6} style={{ alignSelf: "center" }} />
      <span style={{ position: "relative", height: "46%", display: "block" }}>
        <Cover fg={fg} accent={accent} style={{ height: "100%" }} />
        <span
          className="tt-bubble"
          style={{ background: bg, boxShadow: `inset 0 0 0 1px ${fg}` }}
        />
      </span>
      <span className="tt-row">
        <Lines color={fg} n={3} />
        <Lines color={fg} n={3} />
        <Dot color={fg} />
      </span>
    </>
  ),

  "masterpiece-playlist": ({ bg, fg, accent }) => (
    <>
      <Line color={fg} w="70%" h={4} />
      <Line color={fg} w="42%" o={0.5} />
      <span className="tt-polaroid" style={{ background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.18)" }}>
        <Cover fg={fg} accent={accent} style={{ height: "78%" }} />
      </span>
      <span className="tt-row" style={{ alignItems: "flex-start" }}>
        <Lines color={fg} n={3} style={{ flex: 1 }} />
        <span style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end" }}>
          <Swatches colors={[accent, fg, bg]} />
          <Dot color={fg} style={{ marginTop: 2 }} />
        </span>
      </span>
    </>
  ),

  "masterpiece-graduation": ({ bg, fg, accent }) => (
    <>
      <span className="tt-bleed" style={{ background: coverFill(fg, accent) }} />
      <span className="tt-plate" style={{ background: `${bg}cc`, height: "56%", margin: "auto 6% 6%" }}>
        <Line color={fg} w="30%" o={0.6} />
        <Line color={fg} w="58%" h={3} />
        <Lines color={fg} n={3} style={{ marginTop: 2 }} />
        <span className="tt-row">
          <Line color={fg} w="30%" o={0.4} />
          <Dot color={fg} style={{ marginLeft: "auto" }} />
        </span>
      </span>
    </>
  ),

  "masterpiece-receipt": ({ bg, fg }) => (
    <>
      <span className="tt-bleed" style={{ background: `${fg}10` }} />
      <span className="tt-receipt" style={{ background: bg, boxShadow: `0 1px 3px ${fg}33` }}>
        <Line color={fg} w="62%" h={3} style={{ alignSelf: "center" }} />
        <Line color={fg} w="40%" o={0.5} style={{ alignSelf: "center" }} />
        <span className="tt-dashed" style={{ borderColor: `${fg}66` }} />
        <Lines color={fg} n={4} />
        <span className="tt-dashed" style={{ borderColor: `${fg}66` }} />
        <Dot color={fg} style={{ alignSelf: "center" }} />
      </span>
    </>
  ),
};

export default function ThemeThumb({ layout, colors }) {
  const [bg, fg, accent] = colors;
  const render = THUMBS[layout] || THUMBS.classic;
  return (
    <span className="theme-thumb" style={{ background: bg }} aria-hidden="true">
      {render({ bg, fg, accent })}
    </span>
  );
}
