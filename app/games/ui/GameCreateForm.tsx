"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Opt = { id: string; label: string };

export default function GameCreateForm() {
  const router = useRouter();

  // Form state
  const [seasonId, setSeasonId] = useState<string>(""); // empty => exhibition
  const [teamAId, setTeamAId] = useState<string>("");
  const [teamBId, setTeamBId] = useState<string>("");
  const [colorA, setColorA] = useState<"white" | "black" | "natural">("white");
  const [colorB, setColorB] = useState<"white" | "black" | "natural">("black");
  const [targetPoints, setTargetPoints] = useState<number | "">("");
  const [scheduledAtLocal, setScheduledAtLocal] = useState<string>(""); // HTML datetime-local
//   const [timezone, setTimezone] = useState<string>("America/New_York");
  const [location, setLocation] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Data
  const [seasons, setSeasons] = useState<Opt[]>([]);
  const [teams, setTeams] = useState<Opt[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [seasonsRes, teamsRes] = await Promise.all([
          fetch("/api/seasons?size=200", { cache: "no-store" }),
          fetch("/api/teams?size=200", { cache: "no-store" }),
        ]);
        if (!seasonsRes.ok) throw new Error(`Failed to fetch seasons: ${seasonsRes.status}`);
        if (!teamsRes.ok) throw new Error(`Failed to fetch teams: ${teamsRes.status}`);

        const seasonsPayload = await seasonsRes.json();
        const teamsPayload = await teamsRes.json();
        const seasonData = (seasonsPayload?.data ?? []) as Array<{ ID: number | string; Name: string }>;
        const teamData = (teamsPayload?.data ?? []) as Array<{ ID: number | string; Name: string }>;

        if (!alive) return;
        setSeasons(seasonData.map((s) => ({ id: String(s.ID), label: s.Name || `Season #${s.ID}` })));
        setTeams(teamData.map((t) => ({ id: String(t.ID), label: t.Name || `Team #${t.ID}` })));
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load form data");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const teamBOptions = useMemo(() => teams.filter((t) => t.id !== teamAId), [teams, teamAId]);
  const teamAOptions = useMemo(() => teams.filter((t) => t.id !== teamBId), [teams, teamBId]);

  const canSubmit =
    !loading &&
    teamAId &&
    teamBId &&
    teamAId !== teamBId;

  function toRFC3339(local: string | undefined | null): string | undefined {
    // HTML datetime-local gives "YYYY-MM-DDTHH:mm". Interpret as local time and convert to ISO.
    if (!local) return undefined;
    const d = new Date(local);
    if (isNaN(+d)) return undefined;
    return d.toISOString();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    const body: Record<string, any> = {
      matchType: "teams",
      sideA: { teamId: Number(teamAId), color: colorA },
      sideB: { teamId: Number(teamBId), color: colorB },
    };

    if (seasonId) body.seasonId = Number(seasonId);          // omit => exhibition
    if (targetPoints !== "" && Number(targetPoints) > 0) body.targetPoints = Number(targetPoints);
    const scheduledIso = toRFC3339(scheduledAtLocal);
    if (scheduledIso) body.scheduledAt = scheduledIso;
    // if (timezone) body.timezone = timezone;
    if (location.trim()) body.location = location.trim();
    if (description.trim()) body.description = description.trim();

    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Failed to create game");
      }

      // Reset some fields, keep season to speed multi-entry
      setTeamAId("");
      setTeamBId("");
      setColorA("white");
      setColorB("black");
      setTargetPoints("");
      setScheduledAtLocal("");
      setLocation("");
      setDescription("");
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to create game");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Create Game (Teams)</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        {/* Season (optional) */}
        <div className="space-y-1">
          <label htmlFor="season" className="text-sm font-medium">Season</label>
          <select
            id="season"
            value={seasonId}
            onChange={(e) => setSeasonId(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            disabled={loading}
          >
            <option value="">Exhibition (no season)</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <p className="text-xs text-neutral-500">Leave as “Exhibition” to create a game without a season.</p>
        </div>

        {/* Teams */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="teamA" className="text-sm font-medium">Team A</label>
            <select
              id="teamA"
              value={teamAId}
              onChange={(e) => setTeamAId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              disabled={loading || teams.length === 0}
              required
            >
              <option value="">Select team…</option>
              {teamAOptions.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="teamB" className="text-sm font-medium">Team B</label>
            <select
              id="teamB"
              value={teamBId}
              onChange={(e) => setTeamBId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              disabled={loading || teams.length === 0}
              required
            >
              <option value="">Select team…</option>
              {teamBOptions.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Colors */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="colorA" className="text-sm font-medium">Team A Color</label>
            <select
              id="colorA"
              value={colorA}
              onChange={(e) => setColorA(e.target.value as any)}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="white">White</option>
              <option value="black">Black</option>
              <option value="natural">Natural</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="colorB" className="text-sm font-medium">Team B Color</label>
            <select
              id="colorB"
              value={colorB}
              onChange={(e) => setColorB(e.target.value as any)}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="white">White</option>
              <option value="black">Black</option>
              <option value="natural">Natural</option>
            </select>
          </div>
        </div>

        {/* Scheduling / meta */}
        {/* <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="scheduledAt" className="text-sm font-medium">Scheduled</label>
            <input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAtLocal}
              onChange={(e) => setScheduledAtLocal(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="timezone" className="text-sm font-medium">Timezone</label>
            <input
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="America/New_York"
            />
          </div>
        </div> */}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="target" className="text-sm font-medium">Target Points</label>
            <input
              id="target"
              type="number"
              min={1}
              value={targetPoints}
              onChange={(e) => setTargetPoints(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="100 (default)"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="location" className="text-sm font-medium">Location</label>
            <input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Garden Grove"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="desc" className="text-sm font-medium">
            Description <span className="text-neutral-400">(optional)</span>
          </label>
          <input
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="A rematch for honor"
          />
        </div>

        {teamAId && teamBId && teamAId === teamBId && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Teams must be different.
          </div>
        )}
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
          {submitting ? "Creating…" : "Create Game"}
        </button>
      </form>
    </div>
  );
}
