const SPOTIFY_ID_RE = /^[a-zA-Z0-9]+$/;
const URL_SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;

const RESOURCE_LABELS = {
  album: "album",
  artist: "artist",
  collection: "library",
  episode: "podcast episode",
  playlist: "playlist",
  show: "podcast show",
  track: "track",
  user: "profile",
};

function makeAlbumError(message, code = "spotify_album_url_invalid") {
  const err = new Error(message);
  err.code = code;
  return err;
}

function isSpotifyHost(hostname) {
  return hostname === "spotify.com" || hostname.endsWith(".spotify.com");
}

function isSpotifyShortLink(hostname) {
  return hostname === "spotify.link" || hostname.endsWith(".spotify.link");
}

function normalizeInputUrl(value) {
  if (URL_SCHEME_RE.test(value)) {
    return value;
  }

  if (/^(?:[\w-]+\.)?spotify\.(?:com|link)\//i.test(value)) {
    return `https://${value}`;
  }

  return value;
}

function getSpotifyResourceTypeLabel(resourceType) {
  return RESOURCE_LABELS[resourceType] || resourceType;
}

function invalidAlbumLinkError(resourceType) {
  return makeAlbumError(
    `That's a Spotify ${getSpotifyResourceTypeLabel(resourceType)} link. Paste an album link instead.`,
    `spotify_${resourceType}_link`,
  );
}

function validateAlbumId(id) {
  if (!id || !SPOTIFY_ID_RE.test(id)) {
    throw makeAlbumError(
      "That Spotify album link looks incomplete. Copy the full album link and try again.",
      "spotify_album_link_incomplete",
    );
  }

  return id;
}

function getUrlResource(parts) {
  const cleanParts = [...parts];

  while (cleanParts[0]?.startsWith("intl-") || cleanParts[0] === "embed") {
    cleanParts.shift();
  }

  if (cleanParts[0] === "user" && cleanParts[2] === "playlist") {
    return { resourceType: "playlist", resourceId: cleanParts[3] };
  }

  return {
    resourceType: cleanParts[0] || "",
    resourceId: cleanParts[1] || "",
  };
}

function extractAlbumId(value) {
  if (!value) {
    throw makeAlbumError("Paste a Spotify album URL to continue.", "spotify_album_url_missing");
  }

  if (value.startsWith("spotify:")) {
    const parts = value.split(":");

    if (parts[1] === "user" && parts[3] === "playlist") {
      throw invalidAlbumLinkError("playlist");
    }

    const resourceType = parts[1];
    const resourceId = parts[2];

    if (!resourceType) {
      throw makeAlbumError(
        "That Spotify link looks incomplete. Copy the full album link and try again.",
        "spotify_link_incomplete",
      );
    }

    if (resourceType !== "album") {
      throw invalidAlbumLinkError(resourceType);
    }

    return validateAlbumId(resourceId);
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(normalizeInputUrl(value));
  } catch {
    throw makeAlbumError(
      "That doesn't look like a Spotify link. Paste a Spotify album URL.",
      "spotify_url_invalid",
    );
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (isSpotifyShortLink(hostname)) {
    throw makeAlbumError(
      "Short Spotify share links aren't supported yet. Open the album in Spotify and copy the full album URL.",
      "spotify_short_link_unsupported",
    );
  }

  if (!isSpotifyHost(hostname)) {
    throw makeAlbumError(
      "That doesn't look like a Spotify link. Paste a Spotify album URL.",
      "spotify_host_invalid",
    );
  }

  const { resourceType, resourceId } = getUrlResource(
    parsedUrl.pathname.split("/").filter(Boolean),
  );

  if (!resourceType) {
    throw makeAlbumError(
      "That Spotify link looks incomplete. Copy the full album link and try again.",
      "spotify_link_incomplete",
    );
  }

  if (resourceType !== "album") {
    throw invalidAlbumLinkError(resourceType);
  }

  return validateAlbumId(resourceId);
}

function msToTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export async function fetchAlbum(url) {
  const id = extractAlbumId(url);

  // The Next.js API route handles Spotify tokens securely on the server-side.
  let res;

  try {
    res = await fetch(`/api/spotify/album/${id}`);
  } catch {
    throw makeAlbumError(
      "Couldn't reach Spotify right now. Check your connection and try again.",
      "spotify_request_failed",
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw makeAlbumError(
      err.error || "Spotify couldn't load that album right now. Try again in a moment.",
      err.code || "spotify_album_fetch_failed",
    );
  }

  const data = await res.json();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const parts = (data.release_date || "").split("-");
  const year = parts[0] || "";
  const monthIdx = parts[1] ? parseInt(parts[1], 10) - 1 : -1;
  const day = parts[2] ? parseInt(parts[2], 10) : null;
  const monthName = monthIdx >= 0 ? months[monthIdx] : "";
  const releaseDateFormatted = day
    ? `${year} / ${monthName} ${day}`
    : monthIdx >= 0
      ? `${year} / ${monthName}`
      : year;

  let totalMs = 0;
  const tracks = (data.tracks?.items || []).map((t, i) => {
    totalMs += t.duration_ms;
    return {
      number: i + 1,
      name: t.name,
      artists: (t.artists || []).map((a) => a.name).join(", "),
      duration: msToTime(t.duration_ms),
    };
  });

  return {
    name: data.name,
    artists: (data.artists || []).map((a) => a.name).join(", "),
    releaseDate: releaseDateFormatted,
    releaseYear: year,
    totalTracks: data.total_tracks || tracks.length,
    totalDuration: msToTime(totalMs),
    tracks,
    coverUrl: data.images?.[0]?.url || "",
    spotifyUrl: data.external_urls?.spotify || url,
    uri: data.uri || `spotify:album:${id}`,
    albumType: (data.album_type || "album").toUpperCase(),
  };
}
