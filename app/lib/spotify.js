const SPOTIFY_ID_RE = /^[a-zA-Z0-9]+$/;
const URL_SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;
const SUPPORTED_RESOURCE_TYPES = new Set(["album", "track"]);

const RESOURCE_LABELS = {
  album: "album",
  artist: "artist",
  collection: "library",
  episode: "podcast episode",
  playlist: "playlist",
  show: "podcast show",
  track: "song",
  user: "profile",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function makeSpotifyError(message, code = "spotify_url_invalid") {
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

function unsupportedResourceError(resourceType) {
  return makeSpotifyError(
    `That's a Spotify ${getSpotifyResourceTypeLabel(resourceType)} link. Paste an album or song link instead.`,
    `spotify_${resourceType}_link`,
  );
}

function validateSpotifyId(id, resourceType) {
  if (!id || !SPOTIFY_ID_RE.test(id)) {
    const resourceLabel = getSpotifyResourceTypeLabel(resourceType);
    throw makeSpotifyError(
      `That Spotify ${resourceLabel} link looks incomplete. Copy the full ${resourceLabel} link and try again.`,
      `spotify_${resourceType}_link_incomplete`,
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

function parseSpotifyResource(value) {
  if (!value) {
    throw makeSpotifyError(
      "Paste a Spotify album or song URL to continue.",
      "spotify_url_missing",
    );
  }

  if (value.startsWith("spotify:")) {
    const parts = value.split(":");

    if (parts[1] === "user" && parts[3] === "playlist") {
      throw unsupportedResourceError("playlist");
    }

    const resourceType = parts[1];
    const resourceId = parts[2];

    if (!resourceType) {
      throw makeSpotifyError(
        "That Spotify link looks incomplete. Copy the full album or song link and try again.",
        "spotify_link_incomplete",
      );
    }

    if (!SUPPORTED_RESOURCE_TYPES.has(resourceType)) {
      throw unsupportedResourceError(resourceType);
    }

    return {
      resourceType,
      resourceId: validateSpotifyId(resourceId, resourceType),
    };
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(normalizeInputUrl(value));
  } catch {
    throw makeSpotifyError(
      "That doesn't look like a Spotify link. Paste a Spotify album or song URL.",
      "spotify_url_invalid",
    );
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (isSpotifyShortLink(hostname)) {
    throw makeSpotifyError(
      "Couldn't resolve that short Spotify link. Try copying the full album or song URL from Spotify instead.",
      "spotify_short_link_failed",
    );
  }

  if (!isSpotifyHost(hostname)) {
    throw makeSpotifyError(
      "That doesn't look like a Spotify link. Paste a Spotify album or song URL.",
      "spotify_host_invalid",
    );
  }

  const { resourceType, resourceId } = getUrlResource(
    parsedUrl.pathname.split("/").filter(Boolean),
  );

  if (!resourceType) {
    throw makeSpotifyError(
      "That Spotify link looks incomplete. Copy the full album or song link and try again.",
      "spotify_link_incomplete",
    );
  }

  if (!SUPPORTED_RESOURCE_TYPES.has(resourceType)) {
    throw unsupportedResourceError(resourceType);
  }

  return {
    resourceType,
    resourceId: validateSpotifyId(resourceId, resourceType),
  };
}

function joinArtists(artists) {
  return (artists || []).map((artist) => artist.name).join(", ");
}

function formatReleaseDate(rawDate) {
  const parts = (rawDate || "").split("-");
  const year = parts[0] || "";
  const monthIdx = parts[1] ? parseInt(parts[1], 10) - 1 : -1;
  const day = parts[2] ? parseInt(parts[2], 10) : null;
  const monthName = monthIdx >= 0 ? MONTHS[monthIdx] : "";

  const releaseDate = day
    ? `${year} / ${monthName} ${day}`
    : monthIdx >= 0
      ? `${year} / ${monthName}`
      : year;

  return {
    releaseDate,
    releaseYear: year,
  };
}

function msToTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function normalizeAlbum(data, url, id) {
  const { releaseDate, releaseYear } = formatReleaseDate(data.release_date);

  let totalMs = 0;
  const tracks = (data.tracks?.items || []).map((track, index) => {
    totalMs += track.duration_ms;
    return {
      number: index + 1,
      name: track.name,
      artists: joinArtists(track.artists),
      duration: msToTime(track.duration_ms),
    };
  });

  return {
    mediaType: "album",
    name: data.name,
    artists: joinArtists(data.artists),
    releaseDate,
    releaseYear,
    totalTracks: data.total_tracks || tracks.length,
    totalDuration: msToTime(totalMs),
    tracks,
    coverUrl: data.images?.[0]?.url || "",
    spotifyUrl: data.external_urls?.spotify || url,
    uri: data.uri || `spotify:album:${id}`,
    albumType: (data.album_type || "album").toUpperCase(),
    collectionName: data.name,
    collectionType: (data.album_type || "album").toUpperCase(),
    collectionTrackCount: data.total_tracks || tracks.length,
  };
}

function normalizeTrack(data, url, id) {
  const { releaseDate, releaseYear } = formatReleaseDate(data.album?.release_date);
  const duration = msToTime(data.duration_ms || 0);
  const trackNumber = data.track_number || 1;
  const collectionTrackCount = data.album?.total_tracks || null;

  return {
    mediaType: "track",
    name: data.name,
    artists: joinArtists(data.artists),
    releaseDate,
    releaseYear,
    totalTracks: 1,
    totalDuration: duration,
    tracks: [
      {
        number: trackNumber,
        name: data.name,
        artists: joinArtists(data.artists),
        duration,
      },
    ],
    coverUrl: data.album?.images?.[0]?.url || "",
    spotifyUrl: data.external_urls?.spotify || url,
    uri: data.uri || `spotify:track:${id}`,
    albumType: "TRACK",
    collectionName: data.album?.name || "",
    collectionType: (data.album?.album_type || "album").toUpperCase(),
    collectionTrackCount,
    trackNumber,
    discNumber: data.disc_number || 1,
    explicit: Boolean(data.explicit),
    popularity: typeof data.popularity === "number" ? data.popularity : null,
    isrc: data.external_ids?.isrc || "",
  };
}

async function resolveShortLink(shortUrl) {
  try {
    const res = await fetch(`/api/spotify/resolve?url=${encodeURIComponent(shortUrl)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url;
    }
  } catch {}
  return shortUrl;
}

export async function fetchSpotifyItem(url) {
  let inputUrl = url;

  try {
    const normalized = normalizeInputUrl(url);
    const parsed = new URL(normalized);
    if (isSpotifyShortLink(parsed.hostname.toLowerCase())) {
      inputUrl = await resolveShortLink(normalized);
    }
  } catch {}

  const { resourceType, resourceId } = parseSpotifyResource(inputUrl);

  let res;

  try {
    res = await fetch(`/api/spotify/${resourceType}/${resourceId}`);
  } catch {
    throw makeSpotifyError(
      "Couldn't reach Spotify right now. Check your connection and try again.",
      "spotify_request_failed",
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw makeSpotifyError(
      err.error || "Spotify couldn't load that item right now. Try again in a moment.",
      err.code || "spotify_fetch_failed",
    );
  }

  const data = await res.json();

  if (resourceType === "track") {
    return normalizeTrack(data, url, resourceId);
  }

  return normalizeAlbum(data, url, resourceId);
}

