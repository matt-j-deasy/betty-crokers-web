"use client";

import AutoSaveScore from "./AutoSaveScore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Side } from "@/app/lib/types";

type Props = {
  gameId: number;
  matchType: "players" | "teams";
  targetPoints: number;
  status: "scheduled" | "in_progress" | "completed" | "canceled";
  winnerSide: "A" | "B" | null;
  sides: Side[];
  sideALabel: string;
  sideBLabel: string;
  sideAPoints: number;
  sideBPoints: number;
  sideAColor: "white" | "black" | "natural";
  sideBColor: "white" | "black" | "natural";
  location: string;
  description: string;
};

export default function ScoreManager(p: Props) {
  const router = useRouter();
  const [target, setTarget] = useState<number>(p.targetPoints);
  const [status, setStatus] = useState<Props["status"]>(p.status);
  const [location, setLocation] = useState(p.location);
  const [description, setDescription] = useState(p.description);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateGame() {
    try {
      setBusy(true); setError(null);
      const body: any = {
        targetPoints: target,
        status,
        location: location || null,
        description: description || null,
      };
      const res = await fetch(`/api/games/${p.gameId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to update game");
    } finally {
      setBusy(false);
    }
  }

  const scoringDisabled = status === "completed" || status === "canceled";

  return (
    <div className="space-y-4">
      {/* New: two autosave sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AutoSaveScore
          gameId={p.gameId}
          side="A"
          label={p.sideALabel}
          color={p.sideAColor}
          initialPoints={p.sideAPoints}
          maxPoints={target || 100}
          disabled={scoringDisabled}
        />
        <AutoSaveScore
          gameId={p.gameId}
          side="B"
          label={p.sideBLabel}
          color={p.sideBColor}
          initialPoints={p.sideBPoints}
          maxPoints={target || 100}
          disabled={scoringDisabled}
        />
      </div>

      {/* Keep your settings editor below */}
      <div className="rounded-lg border p-3 space-y-3">
        <h3 className="font-semibold">Game Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm">Target Points</label>
            <input
              type="number"
              min={1}
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-full rounded border px-2 py-1"
            />
            <p className="text-xs opacity-70">Sliders will clamp to this value.</p>
          </div>
          <div className="space-y-1">
            <label className="text-sm">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded border px-2 py-1"
            >
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="canceled">Canceled</option>
              {/* completed remains automatic (points ≥ target) */}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded border px-2 py-1"
              placeholder="Main Hall"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border px-2 py-1"
              placeholder="Week 3"
            />
          </div>
        </div>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <div className="flex gap-2">
          <button
            onClick={updateGame}
            disabled={busy}
            className="rounded border px-3 py-1 hover:bg-neutral-50 disabled:opacity-50"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
