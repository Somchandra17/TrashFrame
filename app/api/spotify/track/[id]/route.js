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

    const res = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return spotifyApiError("track", res);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return handleSpotifyRouteError(err, "track");
  }
}
