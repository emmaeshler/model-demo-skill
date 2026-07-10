import { redirect } from "next/navigation";

export default function LoginPage() {
  const adminUrl = process.env.AUTH_ADMIN_URL || "https://password-admin.vercel.app";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ml-explainer.vercel.app";
  const callbackUrl = `${baseUrl}/api/auth/callback`;
  redirect(`${adminUrl}/auth?app=ml-explainer&redirect=${encodeURIComponent(callbackUrl)}`);
}
