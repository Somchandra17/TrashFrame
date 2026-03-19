const ALBUM_URL_RE =
  /open\.spotify\.com\/album\/([a-zA-Z0-9]+)/;

function extractAlbumId(url) {
  const m = url.match(ALBUM_URL_RE);
  if (!m) throw new Error("Invalid Spotify album URL");
  return m[1];
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
  const res = await fetch(`/api/spotify/album/${id}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch album");
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
