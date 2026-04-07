import { NextResponse } from "next/server";
import {
  getSpotifyToken,
  handleSpotifyRouteError,
  jsonError,
  spotifyApiError,
} from "../../_shared";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return jsonError(
        "Missing Spotify track id.",
        400,
        "missing_track_id",
      );
    }

    const token = await getSpotifyToken();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let res;
    try {
      res = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name === "AbortError") {
        return jsonError("Spotify request timed out.", 504, "spotify_timeout");
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      return spotifyApiError("track", res);
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (err) {
    return handleSpotifyRouteError(err, "track");
  }
}
