"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type PlayerOption = { id: string; label: string };

export default function TeamCreateForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [playerAId, setPlayerAId] = useState<string>("");
  const [playerBId, setPlayerBId] = useState<string>("");
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch players for dropdowns
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingPlayers(true);
      try {
        const res = await fetch("/api/players?size=100", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to fetch players: ${res.status}`);
        const payload = await res.json();
        const data = (payload?.data ?? []) as Array<{
          ID: string | number;
          FirstName?: string;
          LastName?: string;
        }>;
        if (!alive) return;
        const opts =
          data.map((p) => ({
            id: String(p.ID),
            label: [p.FirstName, p.LastName].filter(Boolean).join(" ") || `Player #${p.ID}`,
          })) ?? [];
        setPlayers(opts);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load players");
      } finally {
        if (alive) setLoadingPlayers(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!playerAId || !playerBId) return false;
    if (playerAId === playerBId) return false;
    return true;
  }, [name, playerAId, playerBId]);

  const playerBOptions = useMemo(
    () => players.filter((p) => p.id !== playerAId),
    [players, playerAId]
  );
  const playerAOptions = useMemo(
    () => players.filter((p) => p.id !== playerBId),
    [players, playerBId]
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    // Enforce PlayerAID < PlayerBID
    const a = Number(playerAId);
    const b = Number(playerBId);
    const [minId, maxId] = a < b ? [a, b] : [b, a];

    const body: Record<string, any> = {
      name: name.trim(),
      description: description.trim() ? description.trim() : null,
      playerAId: minId,
      playerBId: maxId,
    };

    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      setError(msg || "Failed to create team");
      setSubmitting(false);
      return;
    }

    // Reset name/description, keep player selections for fast multi-entry if desired
    setName("");
    setDescription("");
    setSubmitting(false);
    router.refresh();
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold">Add Team</h2>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="team-name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="team-name"
            name="team-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="e.g., Board Breakers"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="team-desc" className="text-sm font-medium">
            Description <span className="text-neutral-400">(optional)</span>
          </label>
          <textarea
            id="team-desc"
            name="team-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            rows={3}
            placeholder="Aggressive doubles team"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="player-a" className="text-sm font-medium">
              Player A
            </label>
            <select
              id="player-a"
              value={playerAId}
              onChange={(e) => setPlayerAId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              disabled={loadingPlayers || players.length === 0}
              required
            >
              {loadingPlayers && <option>Loading…</option>}
              {!loadingPlayers && players.length === 0 && <option>No players available</option>}
              {!loadingPlayers &&
                players.length > 0 && [
                  <option key="_" value="">
                    Select player…
                  </option>,
                  ...playerAOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  )),
                ]}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="player-b" className="text-sm font-medium">
              Player B
            </label>
            <select
              id="player-b"
              value={playerBId}
              onChange={(e) => setPlayerBId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
              disabled={loadingPlayers || players.length === 0}
              required
            >
              {loadingPlayers && <option>Loading…</option>}
              {!loadingPlayers && players.length === 0 && <option>No players available</option>}
              {!loadingPlayers &&
                players.length > 0 && [
                  <option key="_" value="">
                    Select player…
                  </option>,
                  ...playerBOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  )),
                ]}
            </select>
            <p className="text-xs text-neutral-500">Players must be distinct; A/B order is normalized.</p>
          </div>
        </div>

        {playerAId && playerBId && playerAId === playerBId && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Player A and Player B must be different.
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
          {submitting ? "Creating…" : "Create Team"}
        </button>
      </form>
    </div>
  );
}
