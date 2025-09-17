"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "scheduled" | "in_progress" | "completed" | "canceled";

export default function GameActions({
  gameId,
  status,
winningTeam,
}: {
  gameId: number;
  status: Status | string; // tolerate unknowns
    winningTeam?: "A" | "B" | null;
}) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDisabled = isStarting || isCompleting || status === "in_progress" || status === "completed" || status === "canceled";
  const completeDisabled = isStarting || isCompleting || status === "completed" || status === "canceled";

  async function startGame() {
    try {
      setError(null);
      setIsStarting(true);
      const res = await fetch(`/api/games/${gameId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "in_progress" }),
      });
      if (!res.ok) throw new Error((await res.text()) || `Failed to start (${res.status})`);
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to start game");
    } finally {
      setIsStarting(false);
    }
  }

  async function completeGame() {
    try {
      setError(null);
      setIsCompleting(true);
      const res = await fetch(`/api/games/${gameId}/complete`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ winnerSide: winningTeam }),
      });
      if (!res.ok) throw new Error((await res.text()) || `Failed to complete (${res.status})`);
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to complete game");
    } finally {
      setIsCompleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={startGame}
        disabled={startDisabled}
        className={[
          "rounded-lg px-3 py-2 text-sm font-medium transition",
          startDisabled ? "bg-neutral-300 text-neutral-600 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-500",
        ].join(" ")}
        title="Set status to In Progress"
      >
        {isStarting ? "Starting…" : "Start Game"}
      </button>

      <button
        type="button"
        onClick={completeGame}
        disabled={completeDisabled}
        className={[
          "rounded-lg px-3 py-2 text-sm font-medium transition",
          completeDisabled ? "bg-neutral-300 text-neutral-600 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-500",
        ].join(" ")}
        title="Declare winner and complete"
      >
        {isCompleting ? "Completing…" : "Complete Game"}
      </button>

      {error && (
        <span className="ml-2 text-xs text-red-700" title={error}>
          {error}
        </span>
      )}
    </div>
  );
}
