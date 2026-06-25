import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username } = (await req.json()) as { username?: string };

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  const adminUrl = process.env.AUTH_ADMIN_URL;
  const apiKey = process.env.AUTH_API_KEY;

  if (!adminUrl || !apiKey) {
    return NextResponse.json({ error: "Auth service not configured" }, { status: 500 });
  }

  const res = await fetch(`${adminUrl}/api/auth/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "x-app-name": "ml-explainer",
    },
    body: JSON.stringify({ username, demo: "ml-explainer" }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Auth service error" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
