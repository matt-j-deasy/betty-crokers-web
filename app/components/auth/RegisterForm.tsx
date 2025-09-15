// components/auth/RegisterForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Basic client-side validation
    if (!name.trim()) return setError("Name is required.");
    if (!isEmail(email)) return setError("Enter a valid email.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setSubmitting(true);
    try {
      // If your Go API *requires* explicit role, include it below:
      // const payload = { name, email, password, role: "USER" };
      const payload = { name, email, password };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Registration failed (${res.status})`);
      }

      // Auto sign-in after successful registration
      await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/dashboard"
      });
    } catch (err: any) {
      setError(err?.message || "Registration failed.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border bg-white p-4 w-full">
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-2 text-sm text-red-900">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm">Name (first + last)</label>
        <input
          className="w-full border rounded p-2"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          placeholder="Jane Doe"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm">Email</label>
        <input
          className="w-full border rounded p-2"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="jane@example.com"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm">Password</label>
        <input
          className="w-full border rounded p-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="••••••••"
          required
          minLength={8}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm">Confirm password</label>
        <input
          className="w-full border rounded p-2"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          placeholder="••••••••"
          required
          minLength={8}
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl px-4 py-2 border disabled:opacity-50"
        disabled={submitting}
      >
        {submitting ? "Creating account..." : "Create account"}
      </button>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <a className="underline" href="/login">Sign in</a>
      </div>
    </form>
  );
}
