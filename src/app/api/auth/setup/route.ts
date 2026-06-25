import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "ml_explainer_session";

export async function POST(req: NextRequest) {
  const { username, firstName, lastName, password } = (await req.json()) as {
    username?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
  };

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  const adminUrl = process.env.AUTH_ADMIN_URL;
  const apiKey = process.env.AUTH_API_KEY;

  if (!adminUrl || !apiKey) {
    return NextResponse.json({ error: "Auth service not configured" }, { status: 500 });
  }

  const res = await fetch(`${adminUrl}/api/auth/setup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "x-app-name": "ml-explainer",
    },
    body: JSON.stringify({ username, firstName, lastName, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data.error || "Setup failed" }, { status: res.status });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, JSON.stringify({
    user: data.user.email,
    name: [data.user.firstName, data.user.lastName].filter(Boolean).join(" "),
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
