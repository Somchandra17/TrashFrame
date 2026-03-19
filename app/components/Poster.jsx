"use client";

import QRCode from "react-qr-code";
import { frameAspect } from "../lib/constants";
import { useState, useEffect } from "react";

/* eslint-disable @next/next/no-img-element */

/* ═══════════════════════ DECORATIVE SVG ELEMENTS ═══════════════════════ */

function VinylRecord({ className = "", size = 80, color = "currentColor" }) {
  return (
    <svg
      className={`poster-vinyl ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      style={{ color }}
    >
      {/* Outer ring */}
      <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.5" opacity="0.5" fill="none" />
      {/* Grooves */}
      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.3" opacity="0.4" fill="none" />
      <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="0.3" opacity="0.4" fill="none" />
      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.3" opacity="0.4" fill="none" />
      <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="0.3" opacity="0.4" fill="none" />
      {/* Label area */}
      <circle cx="50" cy="50" r="18" fill="currentColor" opacity="0.15" />
      <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="0.5" fill="none" />
      {/* Center hole */}
      <circle cx="50" cy="50" r="3" fill="currentColor" opacity="0.6" />
      {/* Shine highlight */}
      <ellipse cx="35" cy="35" rx="8" ry="15" fill="currentColor" opacity="0.08" transform="rotate(-45 35 35)" />
    </svg>
  );
}

function SoundWave({ className = "", width = 120, height = 40, color = "currentColor", bars = 32 }) {
  const barWidth = width / (bars * 2);
  return (
    <svg
      className={`poster-soundwave ${className}`}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ color }}
    >
      {Array.from({ length: bars }).map((_, i) => {
        // Use a simple pseudo-random hash based on index `i` to ensure hydration consistency
        const pseudoRandom1 = (Math.sin(i * 12.9898) * 43758.5453) % 1;
        const pseudoRandom2 = (Math.cos(i * 78.233) * 43758.5453) % 1;
        const h = Math.sin((i / bars) * Math.PI) * 0.7 + Math.abs(pseudoRandom1) * 0.3;
        const barHeight = h * height * 0.8;
        return (
          <rect
            key={i}
            x={i * barWidth * 2 + barWidth * 0.5}
            y={(height - barHeight) / 2}
            width={barWidth}
            height={barHeight}
            fill="currentColor"
            opacity={0.6 + Math.abs(pseudoRandom2) * 0.4}
            rx={barWidth / 2}
          />
        );
      })}
    </svg>
  );
}

function MusicNote({ className = "", size = 24, color = "currentColor" }) {
  return (
    <svg
      className={`poster-note ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ color }}
    >
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}

function DoubleNote({ className = "", size = 32, color = "currentColor" }) {
  return (
    <svg
      className={`poster-note ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ color }}
    >
      <path d="M21 3v12.5a3.5 3.5 0 1 1-2-3.15V5h-8v11.5a3.5 3.5 0 1 1-2-3.15V3h12z" />
    </svg>
  );
}

function Signature({ className = "", artistName = "Artist" }) {
  return (
    <div className={`poster-signature ${className}`}>
      <svg width="80" height="30" viewBox="0 0 80 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M5 20 Q15 5 25 15 T45 12 Q55 8 65 18 L75 15" opacity="0.7" />
        <path d="M10 25 Q20 22 30 25" opacity="0.5" />
      </svg>
    </div>
  );
}

function ArtisticBorder({ className = "" }) {
  return (
    <div className={`poster-art-border ${className}`}>
      <div className="poster-art-border-corner poster-art-border-tl" />
      <div className="poster-art-border-corner poster-art-border-tr" />
      <div className="poster-art-border-corner poster-art-border-bl" />
      <div className="poster-art-border-corner poster-art-border-br" />
    </div>
  );
}

function TextureOverlay({ type = "grain" }) {
  return <div className={`poster-texture poster-texture-${type}`} />;
}

function StarRating({ rating = 5, className = "" }) {
  return (
    <div className={`poster-stars ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

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

function BottomCode({ url, uri, codeType, barColor }) {
  const bar = barColor || "black";
  const [svgStr, setSvgStr] = useState("");

  useEffect(() => {
    if (codeType === "scannable" && uri) {
      const bg = bar === "black" ? "ffffff" : "000000";
      const src = `https://scannables.scdn.co/uri/plain/svg/${bg}/${bar}/640/${uri}`;
      
      fetch(src)
        .then((res) => res.text())
        .then((text) => {
          // Remove the first background rect so it is purely transparent, to support html-to-image exports
          let transparentSvg = text.replace(/<rect[^>]*fill="[^"]*"[^>]*\/>/i, '');
          // Inject our scaling class dynamically
          transparentSvg = transparentSvg.replace('<svg ', '<svg class="poster-spotify-code" ');
          setSvgStr(transparentSvg);
        })
        .catch((e) => console.error("Could not load Spotify Scannable SVG", e));
    }
  }, [codeType, uri, bar]);

  if (codeType === "scannable" && uri) {
    if (!svgStr) return <div className="poster-code-wrap" style={{ height: 'var(--fp-qr-size)' }} />;
    return (
      <div 
        className="poster-code-wrap" 
        dangerouslySetInnerHTML={{ __html: svgStr }} 
      />
    );
  }

  return (
    <div className="poster-qr-wrap">
      <QRCode value={url} size={48} fgColor="var(--fp-qr-fg, #111)" bgColor="transparent" />
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

function LayoutClassic({ album, quote, codeType, barColor }) {
  return (
    <>
      <TextureOverlay type="grain" />
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
        <div className="poster-bottom-right">
          <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} barColor={barColor} />
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════ GALLERY (Drake "More Life") ═══════════════════════ */

function LayoutGallery({ album, quote, codeType, albumColors, barColor }) {
  const swatches = (albumColors && albumColors.length >= 2) ? albumColors.slice(0, 5) : null;
  return (
    <>
      <TextureOverlay type="paper" />
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
          <Signature artistName={album.artists} />
          <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} barColor={barColor} />
          <p className="poster-artist">{album.artists}</p>
          <p className="poster-title poster-title-sm">{album.name}</p>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════ EDITORIAL (Beatles "Hey Jude") ═══════════════════════ */

function LayoutEditorial({ album, quote, codeType, barColor }) {
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

function LayoutBoldBlock({ album, quote, codeType, barColor }) {
  return (
    <>
      <TextureOverlay type="halftone" />
      <div className="poster-boldblock-top">
        <div className="poster-boldblock-title-area">
          <h1 className="poster-title">{album.name}</h1>
          <p className="poster-artist">{album.artists}</p>
        </div>
        <span className="poster-boldblock-side-text">{album.albumType}</span>
        <span className="poster-boldblock-price">99p</span>
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
        <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} barColor={barColor} />
      </div>
    </>
  );
}



/* ═══════════════════════ IMMERSIVE (SZA "SOS") ═══════════════════════ */

function LayoutImmersive({ album, quote, codeType, barColor }) {
  return (
    <>
      <Cover src={album.coverUrl} name={album.name} className="poster-cover-fullbleed" />
      <TextureOverlay type="film" />
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
        <SoundWave className="poster-immersive-wave" width={160} height={24} bars={48} />
        <div className="poster-immersive-meta-row">
          <span className="poster-meta">
            {album.releaseDate} &bull; {album.totalTracks} tracks &bull; {album.totalDuration}
          </span>
          <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} barColor={barColor} />
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════ RETRO (Disco poster) ═══════════════════════ */

function LayoutRetro({ album, quote, codeType, barColor }) {
  return (
    <>
      <TextureOverlay type="vintage" />
      <div className="poster-retro-glow" />
      <MusicNote className="poster-retro-note poster-retro-note-1" size={20} />
      <DoubleNote className="poster-retro-note poster-retro-note-2" size={28} />
      <MusicNote className="poster-retro-note poster-retro-note-3" size={16} />
      <div className="poster-retro-header">
        <span className="poster-retro-kicker">{album.albumType} EDITION</span>
        <p className="poster-artist">{album.artists}</p>
        <h1 className="poster-title">{album.name}</h1>
      </div>
      <div className="poster-retro-stage">
        <div className="poster-retro-image-frame">
          <VinylRecord className="poster-retro-vinyl" size={54} />
          <Cover src={album.coverUrl} name={album.name} />
        </div>
        <div className="poster-retro-track-panel">
          <div className="poster-retro-track-header">
            <span>SIDE A / SIDE B</span>
            <span>{album.totalTracks} TRACKS</span>
          </div>
          <div className="poster-tracklist poster-retro-tracklist">
            {album.tracks.map((t) => (
              <TrackRow key={t.number} t={t} hideArtists hideDur />
            ))}
          </div>
        </div>
      </div>
      <div className="poster-retro-footer">
        {quote && <p className="poster-quote">&ldquo;{quote}&rdquo;</p>}
        <StarRating rating={5} className="poster-retro-stars" />
        <div className="poster-retro-meta-row">
          <span className="poster-meta">{album.releaseDate} &bull; {album.totalDuration}</span>
          <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} barColor={barColor} />
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════ OVERLAY (Kanye "Graduation") ═══════════════════════ */

function LayoutOverlay({ album, quote, codeType, barColor }) {
  return (
    <>
      <Cover src={album.coverUrl} name={album.name} className="poster-cover-bg" />
      <TextureOverlay type="grain" />
      <VinylRecord className="poster-overlay-vinyl" size={100} />
      <div className="poster-overlay-content">
        <div className="poster-overlay-header">
          <p className="poster-artist">{album.artists}</p>
          <h1 className="poster-title">{album.name}</h1>
        </div>
        <div className="poster-tracklist">
          {album.tracks.map((t) => <TrackRow key={t.number} t={t} hideArtists />)}
        </div>
        {quote && <p className="poster-quote">&ldquo;{quote}&rdquo;</p>}
        <SoundWave className="poster-overlay-wave" width={140} height={30} bars={40} />
        <div className="poster-overlay-bottom">
          <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} barColor={barColor} />
          <p className="poster-meta">{album.totalDuration} &bull; {album.releaseDate}</p>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════ MASTERPIECE: J-CARD ═══════════════════════ */

function LayoutMasterpieceJCard({ album, quote, codeType, barColor }) {
  return (
    <>
      <div className="jcard-spine">
        <div className="jcard-spine-top">
          <DoubleNote size={20} className="jcard-spine-icon" />
          <div className="jcard-spine-dolby">
            <span className="dolby-d">D</span><span className="dolby-d flipped">D</span>
          </div>
        </div>
        <div className="jcard-spine-text">{album.artists} &mdash; {album.name}</div>
        <div className="jcard-spine-bottom">
          <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} barColor={barColor} />
        </div>
      </div>
      <div className="jcard-front">
        <Cover src={album.coverUrl} name={album.name} />
      </div>
      <div className="jcard-back">
        <div className="jcard-back-header">
          <h1 className="poster-title">{album.name}</h1>
          <p className="poster-artist">{album.artists}</p>
        </div>
        <div className="poster-tracklist">
          {album.tracks.map((t) => <TrackRow key={t.number} t={t} hideArtists />)}
        </div>
        {quote && <p className="poster-quote">&ldquo;{quote}&rdquo;</p>}
      </div>
    </>
  );
}

/* ═══════════════════════ MASTERPIECE: COMIC ═══════════════════════ */

function LayoutMasterpieceComic({ album, quote, codeType, barColor }) {
  return (
    <>
      <TextureOverlay type="halftone" />
      <div className="comic-header">
        <h1 className="poster-title">{album.name}</h1>
      </div>
      <div className="comic-image-container">
        <div className="comic-price">99¢</div>
        <Cover src={album.coverUrl} name={album.name} />
        <div className="comic-quote-bubble">
          {quote ? <p className="poster-quote">&ldquo;{quote}&rdquo;</p> : <p className="poster-artist">STARRING {album.artists}</p>}
        </div>
      </div>
      <div className="comic-footer">
        <div className="poster-tracklist">
          {album.tracks.map((t) => <TrackRow key={t.number} t={t} hideArtists />)}
        </div>
        <div className="comic-footer-right">
          <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} barColor={barColor} />
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════ MASTERPIECE: PLAYLIST ═══════════════════════ */

function LayoutMasterpiecePlaylist({ album, quote, codeType, albumColors, barColor }) {
  const swatches = (albumColors && albumColors.length >= 2) ? albumColors.slice(0, 5) : null;
  return (
    <>
      <TextureOverlay type="paper" />
      <h1 className="playlist-title">{album.name}</h1>
      <Cover src={album.coverUrl} name={album.name} className="playlist-image" />
      {quote && <p className="poster-quote">&ldquo;{quote}&rdquo;</p>}
      <div className="playlist-tracks">
        <div className="poster-tracklist">
          {album.tracks.map((t) => <TrackRow key={t.number} t={t} hideArtists hideDur />)}
        </div>
        <div className="playlist-side">
          {swatches && (
            <div className="playlist-palette">
              {swatches.map((c) => (
                <span key={c} className="playlist-swatch" style={{ background: c }} />
              ))}
            </div>
          )}
          <Signature artistName={album.artists} />
          <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} barColor={barColor} />
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════ MASTERPIECE: GRADUATION ═══════════════════════ */

function LayoutMasterpieceGraduation({ album, quote, codeType, barColor }) {
  return (
    <>
      <Cover src={album.coverUrl} name={album.name} className="grad-bg" />
      <TextureOverlay type="grain" />
      <div className="grad-text-plate">
        <div className="grad-header">
          <p className="poster-artist">{album.artists}</p>
          <h1 className="poster-title">{album.name}</h1>
        </div>
        <div className="poster-tracklist">
          {album.tracks.map((t) => <TrackRow key={t.number} t={t} hideArtists />)}
        </div>
        <div className="grad-footer-row">
          <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} barColor={barColor} />
          <SoundWave className="poster-decor-wave" width={80} height={20} bars={20} />
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════ MASTERPIECE: 8-BIT ARCADE ═══════════════════════ */

function LayoutMasterpiece8Bit({ album, quote, codeType, barColor }) {
  const hiScore = String(album.totalTracks * 1250).padStart(6, "0");

  return (
    <>
      <div className="poster-8bit-grid" />
      <div className="poster-8bit-scanlines" />
      <div className="poster-8bit-content">
        <div className="poster-8bit-hud">
          <span className="poster-8bit-chip">1UP {album.releaseYear || "0000"}</span>
          <span className="poster-8bit-chip">HI-SCORE {hiScore}</span>
          <span className="poster-8bit-chip">TIME {album.totalDuration}</span>
        </div>
        <div className="poster-8bit-marquee">
          <span className="poster-8bit-label">{album.albumType}</span>
          <h1 className="poster-title">{album.name}</h1>
          <p className="poster-8bit-artist">PLAYER 1: {album.artists}</p>
        </div>
        <div className="poster-8bit-main">
          <div className="poster-8bit-art-container">
            <span className="poster-8bit-art-label">NOW LOADING</span>
            <Cover src={album.coverUrl} name={album.name} className="poster-8bit-cover" />
          </div>
          <div className="poster-8bit-panel">
            <div className="poster-8bit-panel-header">
              <span>STAGE SELECT</span>
              <span>{album.totalTracks} LEVELS</span>
            </div>
            <div className="poster-8bit-tracklist">
              {album.tracks.map((t) => (
                <TrackRow key={t.number} t={t} hideArtists hideDur />
              ))}
            </div>
          </div>
        </div>
        {quote && <p className="poster-quote">&ldquo;{quote}&rdquo;</p>}
        <div className="poster-bottom-row">
          <div className="poster-8bit-footer-left">
            <span className="poster-8bit-press">PRESS START</span>
            <span className="poster-8bit-credit">CREDIT 01 / {album.releaseYear || "----"}</span>
          </div>
          <div className="poster-8bit-code-frame">
            <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} barColor={barColor} />
          </div>
        </div>
      </div>
    </>
  );
}
/* ═══════════════════════ MASTERPIECE: RECEIPT ═══════════════════════ */

function LayoutMasterpieceReceipt({ album, quote, codeType, barColor }) {
  return (
    <>
      <div className="receipt-container">
        <div className="receipt-header">
          <h1 className="poster-title">{album.name}</h1>
          <p className="poster-artist">{album.artists}</p>
          <div className="receipt-divider" />
          <p className="poster-meta">DATE: {album.releaseDate}</p>
          <p className="poster-meta">ITEMS: {album.totalTracks}</p>
          <div className="receipt-divider" />
        </div>
        
        <div className="poster-tracklist">
          {album.tracks.map((t) => <TrackRow key={t.number} t={t} hideArtists />)}
        </div>
        
        <div className="receipt-footer">
          <div className="receipt-divider" />
          <div className="receipt-total-row">
            <span className="poster-meta">TOTAL DURATION</span>
            <span className="poster-meta">{album.totalDuration}</span>
          </div>
          <div className="receipt-divider" />
          {quote && <p className="poster-quote">&ldquo;{quote}&rdquo;</p>}
          <div className="receipt-barcode">
            <BottomCode url={album.spotifyUrl} uri={album.uri} codeType={codeType} barColor={barColor} />
          </div>
          <p className="poster-meta receipt-thanks">*** THANK YOU ***</p>
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
  immersive: LayoutImmersive,
  retro: LayoutRetro,
  "masterpiece-jcard": LayoutMasterpieceJCard,
  "masterpiece-comic": LayoutMasterpieceComic,
  "masterpiece-playlist": LayoutMasterpiecePlaylist,
  "masterpiece-graduation": LayoutMasterpieceGraduation,
  "masterpiece-8bit": LayoutMasterpiece8Bit,
  "masterpiece-receipt": LayoutMasterpieceReceipt,
};

export default function Poster({ album, quote, frameSize, layout, codeType, albumColors, barColor }) {
  if (!album) return null;

  const aspect = frameAspect(frameSize);
  const layoutKey = layout || "classic";
  const LayoutComponent = LAYOUTS[layoutKey] || LayoutClassic;
  const coverUrl = album.coverUrl;

  return (
    <div
      id="poster-root"
      data-layout={layoutKey}
      style={{ aspectRatio: `${aspect}` }}
    >
      {/* Layer 1 — blurred background bloom */}
      <div
        className="poster-layer-bloom"
        style={{ backgroundImage: `url(${coverUrl})` }}
      />
      {/* Layer 2 — dark/light overlay */}
      <div className="poster-layer-overlay" />
      {/* Layer 3 — ghost watermark */}
      <div
        className="poster-layer-ghost"
        style={{ backgroundImage: `url(${coverUrl})` }}
      />
      {/* Layer 4 — poster content */}
      <div className="poster-content">
        <LayoutComponent
          album={album}
          quote={quote}
          codeType={codeType || "qr"}
          albumColors={albumColors}
          barColor={barColor}
        />
      </div>
      {/* Layer 5 — edge vignette */}
      <div className="poster-layer-vignette" />
    </div>
  );
}
