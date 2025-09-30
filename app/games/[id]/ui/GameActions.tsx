// app/games/[id]/ui/GameActions.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ActionButton from "./ActionButton";

type Status = "scheduled" | "in_progress" | "completed" | "canceled";

type Side = {
  Side: "A" | "B";
  Points?: number | null;
};

export default function GameActions({
  gameId,
  status,
}: {
  gameId: number;
  status: Status | string; // tolerate unknowns
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"start" | "complete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startDisabled =
    !!pending ||
    status === "in_progress" ||
    status === "completed" ||
    status === "canceled";

  const completeDisabled =
    !!pending || status === "completed" || status === "canceled";

  const startGame = useCallback(async () => {
    try {
      setError(null);
      setPending("start");
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
      setPending(null);
    }
  }, [gameId, router]);

  async function determineWinnerFromServer(): Promise<"A" | "B"> {
    const res = await fetch(`/api/games/${gameId}/with-sides`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load latest scores");
    const data = await res.json();
    const sides: Side[] = data?.sides ?? [];
    const a = sides.find((s) => s.Side === "A")?.Points ?? 0;
    const b = sides.find((s) => s.Side === "B")?.Points ?? 0;

    if (a === b) {
      // Choose your policy: block, ask user, or allow server tiebreak rules.
      throw new Error("Scores are tied. Adjust scores before completing.");
    }
    return a > b ? "A" : "B";
  }

  const completeGame = useCallback(async () => {
    try {
      setError(null);
      setPending("complete");

      // Option A (recommended): let the server decide if your API supports it.
      // const res = await fetch(`/api/games/${gameId}/complete`, { method: "POST" });

      // Option B: determine winner at action-time using latest persisted scores.
      const winnerSide = await determineWinnerFromServer();
      const res = await fetch(`/api/games/${gameId}/complete`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ winnerSide }),
      });

      if (!res.ok) throw new Error((await res.text()) || `Failed to complete (${res.status})`);
      router.refresh();
    } catch (e: any) {
      setError(e?.message ?? "Failed to complete game");
    } finally {
      setPending(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, router]);

  return (
    <div className="flex items-center gap-2">
      <ActionButton
        onClick={startGame}
        disabled={startDisabled}
        busy={pending === "start"}
        title="Set status to In Progress"
      >
        Start Game
      </ActionButton>

      <ActionButton
        onClick={completeGame}
        disabled={completeDisabled}
        busy={pending === "complete"}
        variant="success"
        title="Declare winner and complete"
      >
        Complete Game
      </ActionButton>

      {error && (
        <span className="ml-2 text-xs text-red-700" title={error}>
          {error}
        </span>
      )}
    </div>
  );
}
