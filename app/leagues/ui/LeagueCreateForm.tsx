// app/leagues/ui/LeagueCreateForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LeagueCreateForm() {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/leagues", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ Name: name.trim() }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      setError(msg || "Failed to create league");
      setSubmitting(false);
      return;
    }

    setName("");
    setSubmitting(false);
    router.refresh(); // re-fetch list
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Add League</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="e.g., Eastern Division"
          />
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg border bg-white px-4 py-2 hover:bg-neutral-50 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create League"}
        </button>
      </form>
    </div>
  );
}
