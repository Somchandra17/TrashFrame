"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { frameAspect } from "../lib/constants";

/* eslint-disable @next/next/no-img-element */

function Cover({ src, name, className }) {
  return (
    <img
      className={`poster-cover${className ? ` ${className}` : ""}`}
      src={src}
      alt={name}
      crossOrigin="anonymous"
    />
  );
}

function useResolvedBgHex() {
  const [bgHex, setBgHex] = useState("ffffff");
  useEffect(() => {
    function read() {
      const el = document.getElementById("poster-root");
      if (!el) return;
      const raw = getComputedStyle(el).getPropertyValue("--fp-bg").trim().replace("#", "");
      if (/^[0-9a-fA-F]{3,6}$/.test(raw)) {
        setBgHex(raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw);
      }
    }
    const t = setTimeout(read, 50);
    return () => clearTimeout(t);
  });
  return bgHex;
}

function BottomCode({ url, uri, codeType }) {
  const bgHex = useResolvedBgHex();

  if (codeType === "scannable" && uri) {
    const src = `https://scannables.scdn.co/uri/plain/png/${bgHex}/black/640/${uri}`;
    return (
      <div className="poster-code-wrap">
        <img src={src} alt="Spotify Code" className="poster-spotify-code" crossOrigin="anonymous" />
      </div>
    );
  }

  return (
    <div className="poster-qr-wrap">
      <QRCode value={url} size={48} fgColor="var(--fp-qr-fg, #111)" bgColor="var(--fp-qr-bg, #fff)" />
    </div>
  );
}

function TrackRow({ t, hideArtists, hideNum, hideDur }) {
  return (
    <div className="poster-track">
      {!hideNum && (
        <span className="poster-track-num">{String(t.number).padStart(2, "0")}</span>
      )}
      <span className="poster-track-name">{t.name}</span>
      {!hideArtists && <span className="poster-track-artists">{t.artists}</span>}
      {!hideDur && <span className="poster-track-dur">{t.duration}</span>}
    </div>
  );
}

/* ═══════════════════════ CLASSIC ═══════════════════════ */

function LayoutClassic({ album, quote, codeType }) {
  return (
    <>
      <div className="poster-date">{album.releaseDate}</div>
      <Cover src={album.coverUrl} name={album.name} />
      <div className="poster-info">
        <h1 className="poster-title">{album.name}</h1>
        <p className="poster-artist">{album.artists}</p>
        <p className="poster-meta">
          {album.totalTracks} tracks &bull; {album.totalDuration} &bull; {album.releaseYear}
        </p>
      </div>
      {quote && <p className="poster-quote">&ldquo;{quote}&rdquo;</p>}
      <div className="poster-bottom-row">
        <div className="poster-tracklist">
          {album.tracks.map((t) => <TrackRow key={t.number} t={t} />)}
        </div>
        <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} />
      </div>
    </>
  );
}

/* ═══════════════════════ GALLERY (Drake "More Life") ═══════════════════════ */

function LayoutGallery({ album, quote, codeType, albumColors }) {
  const swatches = (albumColors && albumColors.length >= 2) ? albumColors.slice(0, 5) : null;
  return (
    <>
      <h1 className="poster-title">{album.name}</h1>
      <div className="poster-gallery-art-panel">
        <Cover src={album.coverUrl} name={album.name} />
        {quote && <p className="poster-quote">&ldquo;{quote}&rdquo;</p>}
      </div>
      <div className="poster-gallery-body">
        <div className="poster-tracklist">
          {album.tracks.map((t) => <TrackRow key={t.number} t={t} hideArtists hideDur />)}
        </div>
        <div className="poster-gallery-side">
          {swatches && (
            <div className="poster-gallery-palette">
              {swatches.map((c) => (
                <span key={c} className="poster-gallery-swatch" style={{ background: c }} />
              ))}
            </div>
          )}
          <span className="poster-gallery-type">{album.albumType}</span>
        </div>
      </div>
      <div className="poster-gallery-footer">
        <div className="poster-gallery-footer-left">
          <p className="poster-meta">{album.totalDuration}/{album.releaseDate}</p>
          <p className="poster-meta">RELEASED BY: {album.albumType} RECORDS</p>
        </div>
        <div className="poster-gallery-footer-right">
          <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} />
          <p className="poster-artist">{album.artists}</p>
          <p className="poster-title poster-title-sm">{album.name}</p>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════ EDITORIAL (Beatles "Hey Jude") ═══════════════════════ */

function LayoutEditorial({ album, quote, codeType }) {
  return (
    <>
      <div className="poster-editorial-topline">
        <span className="poster-editorial-rule-line" />
        <span className="poster-date">{album.releaseYear}</span>
      </div>
      <div className="poster-editorial-header">
        <p className="poster-artist">{album.artists}</p>
        <h1 className="poster-title">{album.name}</h1>
      </div>
      <Cover src={album.coverUrl} name={album.name} className="poster-cover-hero" />
      <div className="poster-editorial-footer">
        {quote && <p className="poster-quote">&ldquo;{quote}&rdquo;</p>}
        <div className="poster-editorial-rule" />
        <div className="poster-editorial-meta-row">
          <div className="poster-editorial-meta-col">
            <span className="poster-meta-label">{album.albumType} by</span>
            <span className="poster-meta">{album.artists}</span>
          </div>
          <div className="poster-editorial-meta-col">
            <span className="poster-meta-label">From the album</span>
            <span className="poster-meta">{album.name}</span>
          </div>
          <div className="poster-editorial-meta-col">
            <span className="poster-meta-label">Released</span>
            <span className="poster-meta">{album.releaseDate}</span>
          </div>
          <div className="poster-editorial-meta-col">
            <span className="poster-meta-label">Duration</span>
            <span className="poster-meta">{album.totalTracks} tracks &bull; {album.totalDuration}</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════ BOLD BLOCK (Billie "No Time To Die") ═══════════════════════ */

function LayoutBoldBlock({ album, quote, codeType }) {
  return (
    <>
      <div className="poster-boldblock-top">
        <div className="poster-boldblock-title-area">
          <h1 className="poster-title">{album.name}</h1>
          <p className="poster-artist">{album.artists}</p>
        </div>
        <span className="poster-boldblock-side-text">{album.albumType}</span>
      </div>
      <div className="poster-boldblock-image-wrap">
        <Cover src={album.coverUrl} name={album.name} />
        <div className="poster-boldblock-overlay-text">
          <p className="poster-meta">{album.releaseDate}</p>
          {quote && <p className="poster-quote">&ldquo;{quote}&rdquo;</p>}
        </div>
      </div>
      <div className="poster-boldblock-bottom">
        <div className="poster-tracklist">
          {album.tracks.map((t) => <TrackRow key={t.number} t={t} hideArtists />)}
        </div>
        <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} />
      </div>
    </>
  );
}

/* ═══════════════════════ MINIMAL (The 1975) ═══════════════════════ */

function LayoutMinimal({ album, quote, codeType }) {
  return (
    <>
      <div className="poster-minimal-header">
        <p className="poster-artist">{album.artists}</p>
        <p className="poster-meta">
          {album.releaseDate} &bull; {album.totalTracks} tracks &bull; {album.totalDuration}
        </p>
      </div>
      <div className="poster-minimal-center">
        <h1 className="poster-title">{album.name}</h1>
        {quote && <p className="poster-quote">&ldquo;{quote}&rdquo;</p>}
      </div>
      <Cover src={album.coverUrl} name={album.name} className="poster-cover-small" />
      <div className="poster-minimal-bottom">
        <div className="poster-tracklist">
          {album.tracks.map((t) => (
            <span key={t.number} className="poster-track-inline">{t.name}</span>
          ))}
        </div>
        <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} />
      </div>
    </>
  );
}

/* ═══════════════════════ RECEIPT (Tainy "DATA") ═══════════════════════ */

function LayoutReceipt({ album, quote, codeType }) {
  return (
    <>
      <h1 className="poster-title">{album.artists}</h1>
      <p className="poster-artist poster-receipt-album">{album.name}</p>
      <Cover src={album.coverUrl} name={album.name} className="poster-cover-small" />
      <div className="poster-receipt-date-row">
        <span className="poster-meta">{album.releaseDate}</span>
        <span className="poster-meta">{album.totalTracks} tracks</span>
      </div>
      <div className="poster-receipt-divider" />
      <div className="poster-tracklist">
        {album.tracks.map((t) => <TrackRow key={t.number} t={t} hideArtists />)}
      </div>
      <div className="poster-receipt-divider poster-receipt-divider-dashed" />
      <div className="poster-receipt-total">
        <span>TOTAL</span>
        <span>MINUTES</span>
        <span>{album.totalDuration}</span>
      </div>
      <div className="poster-receipt-divider poster-receipt-divider-dashed" />
      {quote && <p className="poster-quote">&ldquo;{quote}&rdquo;</p>}
      <div className="poster-receipt-bottom">
        <div className="poster-receipt-barcode" />
        <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} />
      </div>
    </>
  );
}

/* ═══════════════════════ IMMERSIVE (SZA "SOS") ═══════════════════════ */

function LayoutImmersive({ album, quote, codeType }) {
  return (
    <>
      <Cover src={album.coverUrl} name={album.name} className="poster-cover-fullbleed" />
      <div className="poster-immersive-frame" />
      <div className="poster-immersive-overlay">
        <p className="poster-artist">{album.artists}</p>
        <h1 className="poster-title">{album.name}</h1>
      </div>
      <div className="poster-immersive-bottom">
        {quote && <p className="poster-quote">&ldquo;{quote}&rdquo;</p>}
        <p className="poster-immersive-tracks">
          {album.tracks.map((t, i) => (
            <span key={t.number}>
              {i > 0 && <span className="poster-track-sep"> &ndash; </span>}
              {t.name}
            </span>
          ))}
        </p>
        <div className="poster-immersive-meta-row">
          <span className="poster-meta">
            {album.releaseDate} &bull; {album.totalTracks} tracks &bull; {album.totalDuration}
          </span>
          <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} />
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════ RETRO (Disco poster) ═══════════════════════ */

function LayoutRetro({ album, quote, codeType }) {
  return (
    <>
      <div className="poster-retro-header">
        <p className="poster-artist">{album.artists}</p>
        <h1 className="poster-title">{album.name}</h1>
      </div>
      <div className="poster-retro-image-frame">
        <Cover src={album.coverUrl} name={album.name} />
      </div>
      <div className="poster-retro-footer">
        {quote && <p className="poster-quote">&ldquo;{quote}&rdquo;</p>}
        <div className="poster-retro-meta-row">
          <span className="poster-meta">{album.releaseDate} &bull; {album.totalDuration}</span>
          <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} />
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════ OVERLAY (Kanye "Graduation") ═══════════════════════ */

function LayoutOverlay({ album, quote, codeType }) {
  return (
    <>
      <Cover src={album.coverUrl} name={album.name} className="poster-cover-bg" />
      <div className="poster-overlay-content">
        <div className="poster-overlay-header">
          <p className="poster-artist">{album.artists}</p>
          <h1 className="poster-title">{album.name}</h1>
        </div>
        <div className="poster-tracklist">
          {album.tracks.map((t) => <TrackRow key={t.number} t={t} hideArtists />)}
        </div>
        {quote && <p className="poster-quote">&ldquo;{quote}&rdquo;</p>}
        <div className="poster-overlay-bottom">
          <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} />
          <p className="poster-meta">{album.totalDuration} &bull; {album.releaseDate}</p>
        </div>
      </div>
    </>
  );
}

const LAYOUTS = {
  classic: LayoutClassic,
  gallery: LayoutGallery,
  overlay: LayoutOverlay,
  editorial: LayoutEditorial,
  "bold-block": LayoutBoldBlock,
  minimal: LayoutMinimal,
  receipt: LayoutReceipt,
  immersive: LayoutImmersive,
  retro: LayoutRetro,
};

export default function Poster({ album, quote, frameSize, layout, codeType, albumColors }) {
  if (!album) return null;

  const aspect = frameAspect(frameSize);
  const layoutKey = layout || "classic";
  const LayoutComponent = LAYOUTS[layoutKey] || LayoutClassic;

  return (
    <div
      id="poster-root"
      data-layout={layoutKey}
      style={{ aspectRatio: `${aspect}` }}
    >
      <LayoutComponent
        album={album}
        quote={quote}
        codeType={codeType || "qr"}
        albumColors={albumColors}
      />
    </div>
  );
}
