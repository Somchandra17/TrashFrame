"use client";

import { useEffect, useRef, useCallback } from "react";

export default function HelpModal({ open, onClose }) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;
      requestAnimationFrame(() => {
        dialogRef.current?.focus();
      });
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="help-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="How to customise your poster"
      onKeyDown={handleKeyDown}
    >
      <div className="help-modal-card" ref={dialogRef} tabIndex={-1}>
        <div className="help-modal-header">
          <h2 className="help-modal-title">How to Customise</h2>
          <button onClick={onClose} className="help-modal-close" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="help-modal-body">
          <section className="help-modal-section">
            <h3 className="help-modal-step-title">1. Download the template</h3>
            <p>
              Click <strong>&ldquo;Download Template CSS&rdquo;</strong> in the
              Theme section. You&rsquo;ll get a <code className="help-modal-code">.css</code> file
              containing all the poster&rsquo;s style variables.
            </p>
          </section>

          <section className="help-modal-section">
            <h3 className="help-modal-step-title">2. Edit the values</h3>
            <p>Open the file in any text editor. Each line looks like:</p>
            <pre className="help-modal-pre">
{`--fp-bg: #ffffff;            /* background color */
--fp-image-filter: grayscale(100%);
--fp-heading-font: 'Georgia', serif;
--fp-quote-font: 'Playfair Display', serif;
--fp-track-columns: 3;`}
            </pre>
            <p>
              Change only the values (right side of the colon).
              Don&rsquo;t rename the variable names on the left.
            </p>
          </section>

          <section className="help-modal-section">
            <h3 className="help-modal-step-title">3. Upload your custom CSS</h3>
            <p>
              Click <strong>&ldquo;Upload Custom CSS&rdquo;</strong> and select
              your edited file. The poster will update instantly. Your theme is
              saved in your browser, so it persists between sessions.
            </p>
          </section>

          <section className="help-modal-section">
            <h3 className="help-modal-step-title">4. Using Google Fonts</h3>
            <p>
              For <code className="help-modal-code">--fp-quote-font</code> and{" "}
              <code className="help-modal-code">--fp-heading-font</code>, you can
              use any{" "}
              <a
                href="https://fonts.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="help-modal-link"
              >
                Google Font
              </a>
              . The app automatically loads fonts it detects in the CSS.
            </p>
          </section>

          <section className="help-modal-section">
            <h3 className="help-modal-step-title">AI Prompt for custom themes</h3>
            <p>
              Paste this into ChatGPT or Claude to generate a theme:
            </p>
            <pre className="help-modal-pre help-modal-pre-wrap">
{`Generate a CSS file containing only a #poster-root { } block with custom values for these variables: --fp-bg, --fp-image-filter, --fp-heading-font, --fp-heading-color, --fp-subtitle-color, --fp-quote-font, --fp-quote-color, --fp-track-font, --fp-track-color, --fp-border-color, --fp-track-columns. Make it a [vintage / neon / pastel / dark] aesthetic. Use Google Fonts. Output only the CSS, nothing else.`}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
