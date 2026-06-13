/**
 * Custom-theme intake helpers.
 *
 * Themes come from an external AI chatbot as raw CSS the user pastes into a
 * file and uploads. That text is injected into a global <style> tag, so it
 * must be (a) validated as an actual TrashFrame theme and (b) scoped so it can
 * only ever restyle the poster (#poster-root) — never the surrounding app.
 */

const SYSTEM_FONTS = new Set([
  "Arial", "Helvetica", "Courier New", "Georgia", "Times New Roman",
  "sans-serif", "serif", "monospace", "cursive", "fantasy", "system-ui",
]);

/**
 * Pull the human font names a theme references, so the app can lazy-load them
 * from Google Fonts. Reads the `--fp-*-font` custom properties and any
 * `family=` segment of a Google Fonts URL. Skips system fonts and Geist
 * (bundled locally). Pure — safe to share between the editor and the sanitizer.
 */
export function extractFontsFromCss(css) {
  const fonts = new Set();
  let m;

  const varRe = /--fp-(?:quote|heading|track)-font:\s*['"]([^'"]+)['"]/g;
  while ((m = varRe.exec(css)) !== null) {
    const name = m[1]?.trim();
    if (name) fonts.add(name);
  }

  const importRe = /family=([^&:'"]+)/g;
  while ((m = importRe.exec(css)) !== null) {
    const name = decodeURIComponent(m[1].replace(/\+/g, " "))?.trim();
    if (name) fonts.add(name);
  }

  return [...fonts].filter((f) => !SYSTEM_FONTS.has(f) && !f.startsWith("Geist"));
}

/* ─────────────────────── sanitizer internals ─────────────────────── */

// Split CSS into top-level blocks { selector, body } by matching braces.
// Text with no trailing block (e.g. prose) is dropped.
function splitRules(css) {
  const rules = [];
  let buf = "";
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch !== "{") {
      buf += ch;
      continue;
    }
    const selector = buf.trim();
    buf = "";
    let depth = 1;
    let body = "";
    i++;
    for (; i < css.length && depth > 0; i++) {
      const c = css[i];
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) break;
      }
      body += c;
    }
    if (selector) rules.push({ selector, body });
  }
  return rules;
}

// Confine a single selector list to inside #poster-root. Root-ish selectors
// collapse to #poster-root; everything else becomes a descendant of it; prose
// accidentally captured as a selector is salvaged down to a real selector or,
// failing that, still prefixed so it can never match outside the poster.
function scopeSelectorList(selectorList) {
  return selectorList
    .split(",")
    .map((raw) => {
      let s = raw.trim();
      if (!s) return "";

      // Salvage a prose-prefixed selector ("Here is the theme: #poster-root").
      const anchor = s.search(/(#poster-root|:root|html\b|body\b|\*|[.#]\w|\[)/);
      if (anchor > 0) s = s.slice(anchor);

      // A theme styling the whole document (e.g. body{display:none}) must never
      // reach the poster — drop bare body/html rules entirely. :root is where
      // people legitimately put the --fp-* variables, so map it to the root.
      if (s === "body" || s === "html") return "";
      if (s === ":root") return "#poster-root";
      if (s === "*") return "#poster-root *";
      if (s === "#poster-root" || s.startsWith("#poster-root")) return s;

      // Strip a leading root token so e.g. "body .x" → "#poster-root .x".
      s = s.replace(/^(?::root|html|body)\b\s*/, "");
      if (!s) return "#poster-root";
      return `#poster-root ${s}`;
    })
    .filter(Boolean)
    .join(", ");
}

function scopeRules(css) {
  return splitRules(css)
    .map(({ selector, body }) => {
      if (selector[0] === "@") {
        if (/^@(?:media|supports)/i.test(selector)) {
          return `${selector} {\n${scopeRules(body)}\n}`;
        }
        if (/^@keyframes/i.test(selector)) {
          // Harmless (referenced by animation-name); keep verbatim.
          return `${selector} {${body}}`;
        }
        return ""; // drop any other at-rule that survived pre-cleaning
      }
      const scoped = scopeSelectorList(selector);
      if (!scoped) return ""; // selector dropped entirely (e.g. bare body{})
      return `${scoped} { ${body.trim()} }`;
    })
    .filter(Boolean)
    .join("\n");
}

/**
 * Validate + scope an uploaded theme.
 * @returns {{ok: true, css: string, varCount: number, fontCount: number}
 *          | {ok: false, error: string}}
 */
export function sanitizeTheme(raw) {
  if (!raw || !raw.trim()) {
    return { ok: false, error: "That file is empty." };
  }

  let css = raw
    .replace(/```[a-zA-Z]*\n?/g, "")        // markdown code fences
    .replace(/```/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")        // comments
    .replace(/@(?:import|charset)\b[^;]*;/gi, "") // external imports
    .replace(/@font-face\s*\{[^}]*\}/gi, "")     // external font files
    // external/script url() refs — keep only data: URIs and #fragments
    .replace(/url\(\s*(['"]?)(?!data:|#)[^)'"]*\1\s*\)/gi, "none");

  css = scopeRules(css).trim();

  if (!css.includes("#poster-root")) {
    return {
      ok: false,
      error:
        "That doesn't look like a TrashFrame theme — it needs a #poster-root { } block.",
    };
  }

  const varMatches = css.match(/--fp-[\w-]+\s*:/g);
  if (!varMatches || varMatches.length === 0) {
    return {
      ok: false,
      error:
        "No theme variables found. The CSS should set --fp-* values inside #poster-root { }.",
    };
  }

  const varCount = new Set(varMatches.map((v) => v.replace(/\s*:$/, ""))).size;
  return { ok: true, css, varCount, fontCount: extractFontsFromCss(css).length };
}
