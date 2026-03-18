"use client";

import { useState } from "react";

export default function CredentialsModal({ open, onClose }) {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  if (!open) return null;

  function handleSave() {
    if (!clientId.trim() || !clientSecret.trim()) return;
    localStorage.setItem("spotify_client_id", clientId.trim());
    localStorage.setItem("spotify_client_secret", clientSecret.trim());
    localStorage.removeItem("spotify_token");
    localStorage.removeItem("spotify_token_expiry");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h2 className="text-lg font-bold text-zinc-900 mb-1">
          Spotify API Credentials
        </h2>
        <p className="text-sm text-zinc-500 mb-6">
          Create an app at{" "}
          <a
            href="https://developer.spotify.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-zinc-700"
          >
            developer.spotify.com
          </a>{" "}
          to get your Client ID and Secret. They are stored only in your browser.
        </p>

        <label className="block mb-4">
          <span className="text-xs font-medium text-zinc-600">Client ID</span>
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="e.g. 1a2b3c4d5e6f…"
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
          />
        </label>

        <label className="block mb-6">
          <span className="text-xs font-medium text-zinc-600">Client Secret</span>
          <input
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder="e.g. 9z8y7x6w5v…"
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
          />
        </label>

        <button
          onClick={handleSave}
          disabled={!clientId.trim() || !clientSecret.trim()}
          className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40 transition"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}
