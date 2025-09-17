"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Color = "white" | "black" | "natural";
type SaveState = "idle" | "saving" | "saved" | "error";

export default function AutoSaveScore({
  gameId,
  side,                // "A" | "B"
  label,               // team/player label
  color,               // "white" | "black" | "natural"
  initialPoints,       // starting points
  maxPoints,           // usually target points (e.g., 100)
  disabled,            // disable when game completed/canceled if desired
  debounceMs = 500,    // save debounce
}: {
  gameId: number;
  side: "A" | "B";
  label: string;
  color: Color;
  initialPoints: number;
  maxPoints: number;
  disabled?: boolean;
  debounceMs?: number;
}) {
  const [value, setValue] = useState<number>(Math.max(0, Math.min(maxPoints, initialPoints)));
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRender = useRef(true);

  // clamp if target changes
  useEffect(() => {
    setValue((v) => Math.min(Math.max(0, v), maxPoints));
  }, [maxPoints]);

  const colorClasses = useMemo(() => {
    switch (color) {
      case "white":
        return "border-neutral-300 bg-gradient-to-r from-white to-neutral-50";
      case "black":
        return "border-neutral-800 bg-gradient-to-r from-neutral-900 to-neutral-700 text-white";
      default:
        return "border-amber-700/70 bg-gradient-to-r from-amber-100 to-amber-50";
    }
  }, [color]);

  async function save(points: number) {
    try {
      setSaveState("saving");
      setError(null);
      const res = await fetch(`/api/games/${gameId}/sides/${side}/points`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ points }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Failed to save points (${res.status})`);
      }
      setSaveState("saved");
    } catch (e: any) {
      setSaveState("error");
      setError(e?.message || "Failed to save");
    }
  }

  // Debounced auto-save when value changes (skip first render)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (disabled) return;
    if (timer.current) clearTimeout(timer.current);
    setSaveState("saving");
    timer.current = setTimeout(() => { void save(value); }, debounceMs);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, disabled, debounceMs]);

  return (
    <div
      className={[
        "rounded-xl border p-4 shadow-sm",
        "flex flex-col gap-3",
        "relative",
        colorClasses,
      ].join(" ")}
      aria-live="polite"
    >
      {/* Color strip on the edge */}
      <div
        className={[
          "absolute top-0 bottom-0 w-1 rounded-l-xl left-0",
          color === "white" ? "bg-white" : color === "black" ? "bg-neutral-900" : "bg-amber-600",
        ].join(" ")}
      />

      <div className="flex items-center justify-between">
        <div className="font-semibold">
          Side {side} <span className="ml-2 text-sm opacity-80">{label}</span>
        </div>
        <StatusBadge state={saveState} error={error} />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={maxPoints}
          step={1}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          disabled={disabled}
          className="w-full accent-current"
          aria-label={`Points for side ${side}`}
        />
        <div className="w-16 text-center text-2xl font-bold tabular-nums">
          {value}
        </div>
      </div>

      <div className="flex justify-between text-xs opacity-80">
        <span>0</span>
        <span>{maxPoints}</span>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ state, error }: { state: SaveState; error: string | null }) {
  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-blue-700">
        <Dot className="bg-blue-600 animate-pulse" /> Saving…
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-700">
        <Dot className="bg-green-600" /> Saved
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-700" title={error ?? undefined}>
        <Dot className="bg-red-600" /> Error
      </span>
    );
  }
  return <span className="text-xs opacity-60">—</span>;
}

function Dot({ className }: { className?: string }) {
  return <span className={["inline-block h-2 w-2 rounded-full", className].join(" ")} />;
}
