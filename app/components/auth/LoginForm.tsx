"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const { data: session, status } = useSession();
  const params = useSearchParams();
  const error = params.get("error"); // NextAuth error code

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    });

    // If redirect is true and success, the page will navigate away.
    setSubmitting(false);
  }

  if (status === "authenticated") {
    return (
      <div className="space-y-4" aria-live="polite">
        <div className="rounded-xl border bg-white p-3 text-sm">
          Signed in as <strong>{session.user?.email}</strong>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            className="flex-1 text-center rounded-xl px-4 py-2 border"
          >
            Enter Site
          </Link>
          <button
            type="button"
            className="rounded-xl px-4 py-2 border"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border bg-white p-4 w-full max-w-sm"
      aria-labelledby="login-heading"
      noValidate={false}
    >
      <h1
        id="login-heading"
        className="text-lg font-semibold"
      >
        Sign in
      </h1>

      {error && (
        <div
          className="rounded-lg border border-red-300 bg-red-50 p-2 text-sm text-red-900"
          role="alert"
          aria-live="assertive"
        >
          Sign-in failed ({error}). Check your email/password or server logs.
        </div>
      )}

      <div className="space-y-1">
        <label
          className="text-sm font-medium"
          htmlFor="email"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          className="w-full border rounded p-2"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          aria-required="true"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label
          className="text-sm font-medium"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          className="w-full border rounded p-2"
          type="password"
          autoComplete="current-password"
          required
          aria-required="true"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl px-4 py-2 border disabled:opacity-50"
        disabled={submitting}
        aria-disabled={submitting}
        aria-busy={submitting}
      >
        {submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
