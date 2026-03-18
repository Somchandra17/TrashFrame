import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const auth = request.headers.get("authorization");

    if (!auth) {
      return NextResponse.json(
        { error: "Missing Authorization header" },
        { status: 401 }
      );
    }

    const res = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
      headers: { Authorization: auth },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Spotify API error", details: text },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Internal error", details: err.message },
      { status: 500 }
    );
  }
}
