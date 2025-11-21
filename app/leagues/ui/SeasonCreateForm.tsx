"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type SeasonCreateFormProps = {
  leagueId: string | number;
};

export default function SeasonCreateForm({ leagueId }: SeasonCreateFormProps) {
  const [name, setName] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !startsOn || !endsOn || !timezone.trim()) return;

    setSubmitting(true);
    setError(null);

    const payload = {
      LeagueID: leagueId,            // backend can accept string or number
      Name: name.trim(),
      StartsOn: startsOn,            // "YYYY-MM-DD" from <input type="date">
      EndsOn: endsOn,
      Timezone: timezone.trim(),
      Description: description.trim() || undefined,
    };

    const res = await fetch("/api/seasons", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      setError(msg || "Failed to create season");
      setSubmitting(false);
      return;
    }

    // Reset form
    setName("");
    setStartsOn("");
    setEndsOn("");
    setTimezone("America/New_York");
    setDescription("");
    setSubmitting(false);

    router.refresh(); // re-fetch seasons list on the league page
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Add Season</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="season-name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="season-name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="e.g., 2025 Spring"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="season-starts" className="text-sm font-medium">
              Starts On
            </label>
            <input
              id="season-starts"
              name="startsOn"
              type="date"
              required
              value={startsOn}
              onChange={(e) => setStartsOn(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="season-ends" className="text-sm font-medium">
              Ends On
            </label>
            <input
              id="season-ends"
              name="endsOn"
              type="date"
              required
              value={endsOn}
              onChange={(e) => setEndsOn(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="season-timezone" className="text-sm font-medium">
            Timezone
          </label>
          <input
            id="season-timezone"
            name="timezone"
            required
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="e.g., America/New_York"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="season-description" className="text-sm font-medium">
            Description <span className="text-xs text-neutral-500">(optional)</span>
          </label>
          <textarea
            id="season-description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            rows={3}
            placeholder="Short description or notes for this season"
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
          {submitting ? "Creating…" : "Create Season"}
        </button>
      </form>
    </div>
  );
}
