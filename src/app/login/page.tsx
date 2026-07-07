"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  { label: "One special character (!@#$%^&*…)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function validatePassword(password: string): string | null {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) return rule.label.toLowerCase();
  }
  return null;
}

function PasswordChecklist({ password }: { password: string }) {
  if (!password) return null;
  return (
    <ul className="mb-3 space-y-1 text-xs">
      {PASSWORD_RULES.map((rule) => {
        const pass = rule.test(password);
        return (
          <li key={rule.label} className={`flex items-center gap-1.5 ${pass ? "text-green-600" : "text-[#999]"}`}>
            <span className="text-[10px]">{pass ? "✓" : "•"}</span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

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

function RequestAccessModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("First name, last name, and email are required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("https://password-admin.vercel.app/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), notes: notes.trim(), urgency, source: "ml-explainer" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
        <div className="mx-4 w-full max-w-sm rounded-xl border border-[#e0e0e0] bg-white p-8 text-center shadow-lg" onClick={e => e.stopPropagation()}>
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600 text-xl font-bold">✓</div>
          <h3 className="text-lg font-semibold text-[#1a1a2e]">Request Submitted</h3>
          <p className="mt-2 text-sm text-[#666]">An administrator has been notified and will review your request. You&apos;ll receive an email once a decision has been made.</p>
          <button onClick={onClose} className="mt-5 text-sm text-[#666] hover:text-[#333]">Close</button>
        </div>
      </div>
    );
  }

  const inputClasses = "w-full rounded-lg border border-[#d0d0d0] px-3 py-2.5 text-sm text-[#1a1a2e] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#00446a] focus:ring-1 focus:ring-[#00446a]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="mx-4 w-full max-w-sm rounded-xl border border-[#e0e0e0] bg-white shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-base font-semibold text-[#1a1a2e]">Request Access</h3>
          <button onClick={onClose} className="text-[#999] hover:text-[#333] text-lg leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <p className="mb-4 text-sm text-[#666]">Fill out the form below and an admin will review your request.</p>
          {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="mb-3 flex gap-3">
            <input placeholder="First Name" required value={firstName} onChange={e => setFirstName(e.target.value)} className={inputClasses} />
            <input placeholder="Last Name" required value={lastName} onChange={e => setLastName(e.target.value)} className={inputClasses} />
          </div>
          <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} className={`${inputClasses} mb-3`} />
          <textarea
            placeholder="Reason for access (e.g. I need to demo for a client meeting)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className={`${inputClasses} mb-4 resize-none`}
          />
          <p className="mb-2 text-sm font-semibold text-[#1a1a2e]">Priority</p>
          <div className="mb-5 flex rounded-lg border border-[#d0d0d0] overflow-hidden">
            {(["urgent", "normal", "low"] as const).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setUrgency(val)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${urgency === val ? (val === "urgent" ? "bg-red-50 text-red-600" : "bg-[#00446a]/5 text-[#00446a]") : "text-[#666] hover:bg-gray-50"} ${val !== "urgent" ? "border-l border-[#d0d0d0]" : ""}`}
              >
                {val === "urgent" ? "Urgent" : val === "normal" ? "Normal" : "Low Priority"}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-[#666] hover:text-[#333]">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-[#00446a] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#003555] disabled:opacity-60">
              {submitting ? <Spinner /> : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type Step = "username" | "password" | "setup";

export default function LoginPage() {
  const router = useRouter();
  const [requestOpen, setRequestOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");
  const [prefill, setPrefill] = useState<{ firstName?: string; lastName?: string }>({});
  const [setupPassword, setSetupPassword] = useState("");

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
    const pwError = validatePassword(password);
    if (pwError) {
      setError(`Password needs ${pwError}.`);
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
            <input type="hidden" name="username" autoComplete="username" value={username} />
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
            <input type="hidden" name="username" autoComplete="username" value={username} />
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
              autoComplete="given-name"
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
              autoComplete="family-name"
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
              autoComplete="new-password"
              placeholder="Create a password"
              value={setupPassword}
              onChange={(e) => setSetupPassword(e.target.value)}
              className="mb-1 w-full rounded-lg border border-[#d0d0d0] px-3 py-2.5 text-sm text-[#1a1a2e] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#00446a] focus:ring-1 focus:ring-[#00446a]"
            />
            <PasswordChecklist password={setupPassword} />
            <label className="mb-1 block text-sm font-medium text-[#555]">
              Confirm Password
            </label>
            <input
              name="confirm"
              type="password"
              required
              autoComplete="new-password"
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

        <div className="mt-5 border-t border-[#eee] pt-5">
          <p className="mb-2 text-center text-[13px] text-[#666]">Don&apos;t have an account?</p>
          <button
            type="button"
            onClick={() => setRequestOpen(true)}
            className="w-full rounded-lg border border-[#ccc] py-2.5 text-sm font-semibold text-[#333] transition-colors hover:border-[#999] hover:bg-[#fafafa]"
          >
            Request Access
          </button>
        </div>
      </div>

      <RequestAccessModal open={requestOpen} onClose={() => setRequestOpen(false)} />
    </div>
  );
}
