"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; label: string };

export default function SeasonAddTeamForm({ seasonId }: { seasonId: string }) {
  const router = useRouter();
  const [allTeams, setAllTeams] = useState<Option[]>([]);
  const [linkedTeams, setLinkedTeams] = useState<string[]>([]);
  const [teamId, setTeamId] = useState("");
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all teams and already-linked teams; filter options to only unlinked
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [teamsRes, linkedRes] = await Promise.all([
          fetch("/api/teams?size=200", { cache: "no-store" }),
          fetch(`/api/seasons/${seasonId}/teams`, { cache: "no-store" }),
        ]);
        if (!teamsRes.ok) throw new Error(`Failed to fetch teams: ${teamsRes.status}`);
        if (!linkedRes.ok) throw new Error(`Failed to fetch season teams: ${linkedRes.status}`);

        const teamsPayload = await teamsRes.json();
        const teamsData = (teamsPayload?.data ?? []) as Array<{
          ID: number | string;
          Name: string;
        }>;

        const linkedPayload = await linkedRes.json();
        const linkedData = (linkedPayload?.data ?? []) as Array<{ ID: number | string }>;

        if (!alive) return;

        setAllTeams(
          teamsData.map((t) => ({ id: String(t.ID), label: t.Name || `Team #${t.ID}` }))
        );
        setLinkedTeams(linkedData.map((t) => String(t.ID)));

      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load data");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [seasonId]);

  const unlinkedOptions = useMemo(
    () => allTeams.filter((t) => !linkedTeams.includes(t.id)),
    [allTeams, linkedTeams]
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!teamId) return;

    setLinking(true);
    setError(null);
    try {
      const res = await fetch("/api/team-seasons", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          teamId: Number(teamId),
          seasonId: Number(seasonId),
          isActive: true,
        }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Failed to link team`);
      }
      // Reset select and refresh page data
      setTeamId("");
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to link team");
    } finally {
      setLinking(false);
    }
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Add Team to Season</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="team" className="text-sm font-medium">Team</label>
          <select
            id="team"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            disabled={loading || unlinkedOptions.length === 0}
            required
          >
            {loading && <option>Loading…</option>}
            {!loading && unlinkedOptions.length === 0 && <option>All teams already linked</option>}
            {!loading && unlinkedOptions.length > 0 && [
              <option key="_" value="">Select a team…</option>,
              ...unlinkedOptions.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              )),
            ]}
          </select>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={linking || !teamId}
          className="rounded-lg border bg-white px-4 py-2 hover:bg-neutral-50 disabled:opacity-50"
        >
          {linking ? "Linking…" : "Add Team"}
        </button>
      </form>
    </div>
  );
}
