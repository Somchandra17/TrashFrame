"use client";

export default function HelpModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-zinc-900">
            How to Customise
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 text-xl leading-none transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 text-sm text-zinc-700 leading-relaxed">
          <section>
            <h3 className="font-semibold text-zinc-900 mb-1">1. Download the template</h3>
            <p>
              Click <strong>&ldquo;Download Template CSS&rdquo;</strong> in the
              Theme section. You&rsquo;ll get a <code className="bg-zinc-100 px-1 rounded text-xs">.css</code> file
              containing all the poster&rsquo;s style variables.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-zinc-900 mb-1">2. Edit the values</h3>
            <p>Open the file in any text editor. Each line looks like:</p>
            <pre className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs overflow-x-auto mt-2 mb-2 text-zinc-600">
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

          <section>
            <h3 className="font-semibold text-zinc-900 mb-1">3. Upload your custom CSS</h3>
            <p>
              Click <strong>&ldquo;Upload Custom CSS&rdquo;</strong> and select
              your edited file. The poster will update instantly. Your theme is
              saved in your browser, so it persists between sessions.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-zinc-900 mb-1">4. Using Google Fonts</h3>
            <p>
              For <code className="bg-zinc-100 px-1 rounded text-xs">--fp-quote-font</code> and{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">--fp-heading-font</code>, you can
              use any{" "}
              <a
                href="https://fonts.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Google Font
              </a>
              . The app automatically loads fonts it detects in the CSS.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-zinc-900 mb-1">AI Prompt for custom themes</h3>
            <p>
              Paste this into ChatGPT or Claude to generate a theme:
            </p>
            <pre className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs overflow-x-auto mt-2 text-zinc-600 whitespace-pre-wrap">
{`Generate a CSS file containing only a #poster-root { } block with custom values for these variables: --fp-bg, --fp-image-filter, --fp-heading-font, --fp-heading-color, --fp-subtitle-color, --fp-quote-font, --fp-quote-color, --fp-track-font, --fp-track-color, --fp-border-color, --fp-track-columns. Make it a [vintage / neon / pastel / dark] aesthetic. Use Google Fonts. Output only the CSS, nothing else.`}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
