import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { client_id, client_secret } = await request.json();

    if (!client_id || !client_secret) {
      return NextResponse.json(
        { error: "Missing client_id or client_secret" },
        { status: 400 }
      );
    }

    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(client_id + ":" + client_secret).toString("base64"),
      },
      body: "grant_type=client_credentials",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Spotify auth failed", details: text },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal error", details: err.message },
      { status: 500 }
    );
  }
}
