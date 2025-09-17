"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Side } from "@/app/lib/types";

type Props = {
  gameId: number;
  matchType: "players" | "teams";
  targetPoints: number;
  status: "scheduled" | "in_progress" | "completed" | "canceled";
  winnerSide: "A" | "B" | null;

  sides: Side[]; // full side objects if you need their IDs later

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

  const [aPts, setAPts] = useState(p.sideAPoints);
  const [bPts, setBPts] = useState(p.sideBPoints);
  const [aColor, setAColor] = useState(p.sideAColor);
  const [bColor, setBColor] = useState(p.sideBColor);
  const [target, setTarget] = useState<number>(p.targetPoints);
  const [status, setStatus] = useState<Props["status"]>(p.status);
  const [location, setLocation] = useState(p.location);
  const [description, setDescription] = useState(p.description);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function call(method: "POST" | "PUT", url: string, body?: any) {
    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      throw new Error((await res.text().catch(() => "")) || `Request failed (${res.status})`);
    }
  }

  const add = async (side: "A" | "B", delta: number) => {
    try {
      setBusy(true); setError(null);
      await call("POST", `/api/games/${p.gameId}/sides/${side}/points/add`, { delta });
      if (side === "A") setAPts((x) => x + delta); else setBPts((x) => x + delta);
      router.refresh();
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };

  const setPoints = async (side: "A" | "B", points: number) => {
    try {
      setBusy(true); setError(null);
      await call("PUT", `/api/games/${p.gameId}/sides/${side}/points`, { points });
      if (side === "A") setAPts(points); else setBPts(points);
      router.refresh();
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };

  const setColor = async (side: "A" | "B", color: "white" | "black" | "natural") => {
    try {
      setBusy(true); setError(null);
      await call("PUT", `/api/games/${p.gameId}/sides/${side}/color`, { color });
      if (side === "A") setAColor(color); else setBColor(color);
      router.refresh();
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };

  const updateGame = async () => {
    try {
      setBusy(true); setError(null);
      const body: any = {
        targetPoints: target,
        status,
        location: location || null,
        description: description || null,
      };
      await call("PUT", `/api/games/${p.gameId}`, body);
      router.refresh();
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  };

  const ScoreCard = ({
    side, label, pts, setPts, color, setColorState,
  }: {
    side: "A" | "B";
    label: string; pts: number; setPts: (n: number) => void;
    color: "white" | "black" | "natural";
    setColorState: (c: "white" | "black" | "natural") => void;
  }) => (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Side {side}</div>
        <div className="text-sm opacity-70">{label}</div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-3xl font-bold tabular-nums">{pts}</div>
        <div className="ml-auto flex items-center gap-2">
          {[1,5,10].map((d) => (
            <button
              key={d}
              onClick={() => add(side, d)}
              disabled={busy}
              className="rounded border px-2 py-1 text-sm hover:bg-neutral-50 disabled:opacity-50"
            >
              +{d}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={pts}
          onChange={(e) => setPts(Number(e.target.value))}
          className="w-24 rounded border px-2 py-1"
        />
        <button
          onClick={() => setPoints(side, pts)}
          disabled={busy}
          className="rounded border px-2 py-1 text-sm hover:bg-neutral-50 disabled:opacity-50"
        >
          Set
        </button>

        <select
          value={color}
          onChange={(e) => { const c = e.target.value as "white"|"black"|"natural"; setColorState(c); setColor(side, c); }}
          className="ml-auto rounded border px-2 py-1"
          disabled={busy || status === "completed" || status === "canceled"}
        >
          <option value="white">White</option>
          <option value="black">Black</option>
          <option value="natural">Natural</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ScoreCard side="A" label={p.sideALabel} pts={aPts} setPts={setAPts} color={aColor} setColorState={setAColor} />
        <ScoreCard side="B" label={p.sideBLabel} pts={bPts} setPts={setBPts} color={bColor} setColorState={setBColor} />
      </div>

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
              {/* completed is automatic via backend when points ≥ target */}
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
