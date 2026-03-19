import { NextResponse } from "next/server";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// In-memory cache for the server-side
let tokenCache = { token: null, expiry: 0 };

function makeError(message, code) {
  const err = new Error(message);
  err.code = code;
  return err;
}

function jsonError(error, status, code, details) {
  return NextResponse.json(
    { error, code, details },
    { status },
  );
}

async function getSpotifyToken() {
  if (tokenCache.token && Date.now() < tokenCache.expiry) {
    return tokenCache.token;
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw makeError(
      "Spotify credentials are missing on the server.",
      "spotify_credentials_missing",
    );
  }

  const base64Credentials = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${base64Credentials}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw makeError(
      `Spotify authentication failed: ${text}`,
      "spotify_auth_failed",
    );
  }

  const data = await res.json();
  tokenCache = {
    token: data.access_token,
    expiry: Date.now() + data.expires_in * 1000 - 60000,
  };

  return data.access_token;
}

export async function GET(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return jsonError(
        "Missing Spotify album id.",
        400,
        "missing_album_id",
      );
    }

    const token = await getSpotifyToken();

    const res = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      let details = "";
      try {
        const data = await res.json();
        details = data?.error?.message || JSON.stringify(data);
      } catch {
        details = await res.text();
      }

      if (res.status === 404) {
        return jsonError(
          "Spotify couldn't find that album.",
          404,
          "spotify_album_not_found",
          details,
        );
      }

      if (res.status === 429) {
        return jsonError(
          "Spotify is rate limiting requests right now. Try again in a minute.",
          429,
          "spotify_rate_limited",
          details,
        );
      }

      if (res.status === 401 || res.status === 403) {
        return jsonError(
          "Spotify rejected the server credentials.",
          res.status,
          "spotify_forbidden",
          details,
        );
      }

      if (res.status === 400) {
        return jsonError(
          "Spotify couldn't read that album request.",
          400,
          "spotify_bad_request",
          details,
        );
      }

      return jsonError(
        "Spotify returned an unexpected album error.",
        res.status,
        "spotify_api_error",
        details,
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    if (err.code === "spotify_credentials_missing") {
      return jsonError(err.message, 500, err.code);
    }

    if (err.code === "spotify_auth_failed") {
      return jsonError(
        "Spotify authentication failed on the server.",
        502,
        err.code,
        err.message,
      );
    }

    return jsonError(
      "Something went wrong while loading that Spotify album.",
      500,
      "internal_error",
      err.message,
    );
  }
}
