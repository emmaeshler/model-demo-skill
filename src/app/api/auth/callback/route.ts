import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "ml_explainer_session";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return redirectToSSO(req, "invalid_token");
  }

  const adminUrl = process.env.AUTH_ADMIN_URL;
  const apiKey = process.env.AUTH_API_KEY;

  if (!adminUrl || !apiKey) {
    return NextResponse.json({ error: "Auth service not configured" }, { status: 500 });
  }

  let data: { user?: { email: string; firstName?: string; lastName?: string } };
  try {
    const res = await fetch(`${adminUrl}/api/auth/exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      return redirectToSSO(req, "invalid_token");
    }

    data = await res.json();
  } catch {
    return redirectToSSO(req, "exchange_failed");
  }

  if (!data.user) {
    return redirectToSSO(req, "invalid_token");
  }

  const baseUrl = getBaseUrl(req);
  const response = NextResponse.redirect(new URL("/", baseUrl));
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

function getBaseUrl(req: NextRequest): string {
  return process.env.NEXT_PUBLIC_BASE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : req.nextUrl.origin);
}

function getCallbackUrl(req: NextRequest): string {
  return `${getBaseUrl(req)}/api/auth/callback`;
}

function redirectToSSO(req: NextRequest, error: string): NextResponse {
  const adminUrl = process.env.AUTH_ADMIN_URL || "https://password-admin.vercel.app";
  const callbackUrl = getCallbackUrl(req);
  const ssoUrl = `${adminUrl}/auth?app=ml-explainer&redirect=${encodeURIComponent(callbackUrl)}&error=${error}`;
  return NextResponse.redirect(ssoUrl);
}
