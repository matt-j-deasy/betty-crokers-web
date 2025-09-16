"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type LeagueOption = { id: string; name: string };

export default function SeasonCreateForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [leagueId, setLeagueId] = useState<string>("");
  const [leagues, setLeagues] = useState<LeagueOption[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch leagues for the dropdown
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingLeagues(true);
      try {
        const res = await fetch("/api/leagues", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to fetch leagues: ${res.status}`);
        const payload = await res.json();
        const data = (payload?.data ?? []) as Array<{ ID: string | number; Name: string }>;
        if (!alive) return;
        const opts = data.map((l) => ({ id: String(l.ID), name: l.Name })) as LeagueOption[];
        setLeagues(opts);
        // default to the only league when exactly one exists
        if (opts.length === 1) setLeagueId(opts[0].id);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load leagues");
      } finally {
        if (alive) setLoadingLeagues(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (leagues.length > 0 && !leagueId) return false;
    return true;
  }, [name, leagueId, leagues.length]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    const body: Record<string, any> = { name: name.trim(), description: description.trim() || undefined };
    if (leagueId) {
        const leagueIdInt = parseInt(leagueId, 10);
        if (!isNaN(leagueIdInt)) body.leagueId = leagueIdInt;
    }

    const res = await fetch("/api/seasons", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      setError(msg || "Failed to create season");
      setSubmitting(false);
      return;
    }

    setName("");
    setDescription("");
    // keep league selected so user can add multiple seasons to same league
    setSubmitting(false);
    router.refresh(); // refresh list
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
            name="season-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="e.g., 2025 Regular Season"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label htmlFor="description" className="text-sm font-medium">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="A brief description of the season."
            rows={2}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="league" className="text-sm font-medium">
            League
          </label>
          <select
            id="league"
            name="league"
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            disabled={loadingLeagues || leagues.length === 0}
            required={leagues.length > 0}
          >
            {loadingLeagues && <option>Loading…</option>}
            {!loadingLeagues && leagues.length === 0 && <option>No leagues available</option>}
            {!loadingLeagues &&
              leagues.length > 0 &&
              [
                // if more than 1 league, show a placeholder option
                ...(leagues.length > 1 ? [<option key="_" value="">Select a league…</option>] : []),
                ...leagues.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                )),
              ]}
          </select>
          <p className="text-xs text-neutral-500">
            {leagues.length === 1
              ? "Defaulted to the only league."
              : "Choose the league this season belongs to."}
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !canSubmit}
          className="rounded-lg border bg-white px-4 py-2 hover:bg-neutral-50 disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create Season"}
        </button>
      </form>
    </div>
  );
}
