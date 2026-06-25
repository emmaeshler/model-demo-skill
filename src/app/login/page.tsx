"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function I2PLogo() {
  return (
    <svg viewBox="0 0 28 28" className="mx-auto size-11" aria-hidden="true">
      <rect x={0} y={0} width={12} height={12} rx={1.5} fill="#d4712a" />
      <rect x={16} y={0} width={12} height={12} rx={1.5} fill="#e8944a" />
      <rect x={0} y={16} width={12} height={12} rx={1.5} fill="#1e2a3a" />
      <rect x={16} y={16} width={12} height={12} rx={1.5} fill="#d4712a" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
    </svg>
  );
}

type Step = "username" | "password" | "setup";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");
  const [prefill, setPrefill] = useState<{ firstName?: string; lastName?: string }>({});

  async function handleUsernameSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!username.trim()) return;
    setError("");
    setPending(true);

    try {
      const res = await fetch("/api/auth/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }

      const data = await res.json();

      if (data.status === "needs_setup") {
        setPrefill({ firstName: data.firstName ?? "", lastName: data.lastName ?? "" });
        setStep("setup");
      } else if (data.status === "active") {
        setStep("password");
      } else if (data.status === "not_found") {
        setStep("password");
      } else if (data.status === "expired") {
        setError("This account has expired. Please contact your administrator.");
      } else if (data.status === "no_access") {
        setError("You don't have access to this presentation. Please contact your administrator.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (res.ok) {
        router.push("/");
        return;
      }

      const data = await res.json().catch(() => null);
      setError(data?.error || "Invalid credentials");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleSetupSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = new FormData(e.currentTarget);
    const firstName = (form.get("firstName") as string)?.trim();
    const lastName = (form.get("lastName") as string)?.trim();
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (!firstName || !lastName) {
      setError("First and last name are required.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);

    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), firstName, lastName, password }),
      });

      if (res.ok) {
        router.push("/");
        return;
      }

      const data = await res.json().catch(() => null);
      setError(data?.error || "Setup failed. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  function handleBack() {
    setStep("username");
    setError("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4">
      <div className="w-full max-w-[400px] rounded-xl border border-[#e0e0e0] bg-white p-8 text-center sm:p-10">
        <I2PLogo />

        <h1 className="mt-4 text-[22px] font-bold text-[#1a1a2e]">
          Inside Your Dynamic Model
        </h1>
        <p className="mb-6 mt-1 text-sm text-[#666]">
          Sign in to view this presentation
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-left text-sm text-red-700">
            {error}
          </div>
        )}

        {step === "username" && (
          <form onSubmit={handleUsernameSubmit} className="text-left">
            <label className="mb-1 block text-sm font-medium text-[#555]">
              Username or Email
            </label>
            <input
              name="username"
              type="text"
              required
              autoFocus
              autoComplete="username"
              placeholder="Enter your username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mb-5 w-full rounded-lg border border-[#d0d0d0] px-3 py-2.5 text-sm text-[#1a1a2e] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#00446a] focus:ring-1 focus:ring-[#00446a]"
            />
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-[#00446a] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#003555] disabled:opacity-60"
            >
              {pending ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner /> Checking…
                </span>
              ) : (
                "Continue"
              )}
            </button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="text-left">
            <p className="mb-4 text-sm text-[#666]">
              Signing in as <strong className="text-[#1a1a2e]">{username}</strong>
            </p>
            <label className="mb-1 block text-sm font-medium text-[#555]">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              placeholder="Enter your password"
              className="mb-5 w-full rounded-lg border border-[#d0d0d0] px-3 py-2.5 text-sm text-[#1a1a2e] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#00446a] focus:ring-1 focus:ring-[#00446a]"
            />
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-[#00446a] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#003555] disabled:opacity-60"
            >
              {pending ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner /> Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
            <div className="mt-3">
              <button
                type="button"
                onClick={handleBack}
                className="text-[13px] text-[#666] hover:text-[#333]"
              >
                &larr; Back
              </button>
            </div>
          </form>
        )}

        {step === "setup" && (
          <form onSubmit={handleSetupSubmit} className="text-left">
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-700">
              Welcome! Set up your account to get started.
            </div>
            <label className="mb-1 block text-sm font-medium text-[#555]">
              First Name
            </label>
            <input
              name="firstName"
              type="text"
              required
              autoFocus
              defaultValue={prefill.firstName}
              placeholder="First name"
              className="mb-3 w-full rounded-lg border border-[#d0d0d0] px-3 py-2.5 text-sm text-[#1a1a2e] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#00446a] focus:ring-1 focus:ring-[#00446a]"
            />
            <label className="mb-1 block text-sm font-medium text-[#555]">
              Last Name
            </label>
            <input
              name="lastName"
              type="text"
              required
              defaultValue={prefill.lastName}
              placeholder="Last name"
              className="mb-3 w-full rounded-lg border border-[#d0d0d0] px-3 py-2.5 text-sm text-[#1a1a2e] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#00446a] focus:ring-1 focus:ring-[#00446a]"
            />
            <label className="mb-1 block text-sm font-medium text-[#555]">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="At least 8 characters"
              className="mb-3 w-full rounded-lg border border-[#d0d0d0] px-3 py-2.5 text-sm text-[#1a1a2e] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#00446a] focus:ring-1 focus:ring-[#00446a]"
            />
            <label className="mb-1 block text-sm font-medium text-[#555]">
              Confirm Password
            </label>
            <input
              name="confirm"
              type="password"
              required
              placeholder="Confirm your password"
              className="mb-5 w-full rounded-lg border border-[#d0d0d0] px-3 py-2.5 text-sm text-[#1a1a2e] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#00446a] focus:ring-1 focus:ring-[#00446a]"
            />
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-[#00446a] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#003555] disabled:opacity-60"
            >
              {pending ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner /> Creating account…
                </span>
              ) : (
                "Create Account"
              )}
            </button>
            <div className="mt-3">
              <button
                type="button"
                onClick={handleBack}
                className="text-[13px] text-[#666] hover:text-[#333]"
              >
                &larr; Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
