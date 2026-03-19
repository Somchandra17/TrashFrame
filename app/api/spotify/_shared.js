import { NextResponse } from "next/server";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let tokenCache = { token: null, expiry: 0 };

export function makeSpotifyError(message, code) {
  const err = new Error(message);
  err.code = code;
  return err;
}

export function jsonError(error, status, code, details) {
  return NextResponse.json(
    { error, code, details },
    { status },
  );
}

export async function getSpotifyToken() {
  if (tokenCache.token && Date.now() < tokenCache.expiry) {
    return tokenCache.token;
  }

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw makeSpotifyError(
      "Spotify credentials are missing on the server.",
      "spotify_credentials_missing",
    );
  }

  const base64Credentials = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
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
    throw makeSpotifyError(
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

async function readErrorDetails(res) {
  try {
    const data = await res.json();
    return data?.error?.message || JSON.stringify(data);
  } catch {
    return res.text();
  }
}

function resourceCode(resourceName, suffix) {
  return `spotify_${resourceName}_${suffix}`;
}

export async function spotifyApiError(resourceName, res) {
  const details = await readErrorDetails(res);

  if (res.status === 404) {
    return jsonError(
      `Spotify couldn't find that ${resourceName}.`,
      404,
      resourceCode(resourceName, "not_found"),
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
      `Spotify couldn't read that ${resourceName} request.`,
      400,
      resourceCode(resourceName, "bad_request"),
      details,
    );
  }

  return jsonError(
    `Spotify returned an unexpected ${resourceName} error.`,
    res.status,
    resourceCode(resourceName, "api_error"),
    details,
  );
}

export function handleSpotifyRouteError(err, resourceName) {
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
    `Something went wrong while loading that Spotify ${resourceName}.`,
    500,
    "internal_error",
    err.message,
  );
}
