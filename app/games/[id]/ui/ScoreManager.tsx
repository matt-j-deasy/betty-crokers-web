// app/games/[id]/ui/ScoreManager.tsx
"use client";

import AutoSaveScore from "./AutoSaveScore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Side } from "@/app/lib/types";

type Status = "scheduled" | "in_progress" | "completed" | "canceled";
type DiscColor = "white" | "black" | "natural";

type Props = {
  gameId: number;
  matchType: "players" | "teams";
  targetPoints: number;
  status: Status;
  winnerSide: "A" | "B" | null;
  sides: Side[];
  sideALabel: string;
  sideBLabel: string;
  sideAPoints: number;
  sideBPoints: number;
  sideAColor: DiscColor;
  sideBColor: DiscColor;
  location: string;
  description: string;
};

const COLOR_OPTIONS: { value: DiscColor; label: string }[] = [
  { value: "white", label: "White" },
  { value: "black", label: "Black" },
  { value: "natural", label: "Natural" },
];

export default function ScoreManager(p: Props) {
  const router = useRouter();
  const target = p.targetPoints; // constant for now

  const [status, setStatus] = useState<Status>(p.status);
  const [location, setLocation] = useState(p.location);
  const [description, setDescription] = useState(p.description);
  const [sideAColor, setSideAColor] = useState<DiscColor>(p.sideAColor);
  const [sideBColor, setSideBColor] = useState<DiscColor>(p.sideBColor);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateGame() {
    try {
      setBusy(true);
      setError(null);

      const body = {
        targetPoints: target,
        status,
        location: location || null,
        description: description || null,
        sideAColor,
        sideBColor,
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
      {/* Two autosave sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AutoSaveScore
          gameId={p.gameId}
          side="A"
          label={p.sideALabel}
          color={sideAColor}
          initialPoints={p.sideAPoints}
          maxPoints={target || 100}
          disabled={scoringDisabled}
        />
        <AutoSaveScore
          gameId={p.gameId}
          side="B"
          label={p.sideBLabel}
          color={sideBColor}
          initialPoints={p.sideBPoints}
          maxPoints={target || 100}
          disabled={scoringDisabled}
        />
      </div>

      {/* Settings */}
      <div className="rounded-lg border p-3 space-y-3">
        <h3 className="font-semibold">Game Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="w-full rounded border px-2 py-1"
            >
              <option value="in_progress">In Progress</option>
              <option value="canceled">Canceled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-sm">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded border px-2 py-1"
              placeholder="Vasen"
            />
          </div>

          {/* Description */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border px-2 py-1"
            />
          </div>

          {/* Colors */}
          <div className="space-y-1">
            <label className="text-sm">Side A Color</label>
            <div className="flex items-center gap-2">
              <span
                className="h-4 w-4 rounded-full border"
                style={{
                  backgroundColor:
                    sideAColor === "white"
                      ? "#ffffff"
                      : sideAColor === "black"
                      ? "#000000"
                      : "#d1b892", // natural-ish
                }}
              />
              <select
                value={sideAColor}
                onChange={(e) => setSideAColor(e.target.value as DiscColor)}
                className="flex-1 rounded border px-2 py-1"
              >
                {COLOR_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm">Side B Color</label>
            <div className="flex items-center gap-2">
              <span
                className="h-4 w-4 rounded-full border"
                style={{
                  backgroundColor:
                    sideBColor === "white"
                      ? "#ffffff"
                      : sideBColor === "black"
                      ? "#000000"
                      : "#d1b892",
                }}
              />
              <select
                value={sideBColor}
                onChange={(e) => setSideBColor(e.target.value as DiscColor)}
                className="flex-1 rounded border px-2 py-1"
              >
                {COLOR_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
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
