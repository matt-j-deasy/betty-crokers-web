"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Color = "white" | "black" | "natural";
type SaveState = "idle" | "saving" | "saved" | "error";

const STEP = 5;
function clampRound(n: number, max: number, step = STEP) {
  const clamped = Math.max(0, Math.min(max, n));
  return Math.round(clamped / step) * step;
}

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
  const [value, setValue] = useState<number>(() => clampRound(initialPoints, maxPoints));
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [popKey, setPopKey] = useState<number>(0); // re-mount to retrigger animation
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRender = useRef(true);

  // Clamp & round if target changes
  useEffect(() => {
    setValue((v) => clampRound(v, maxPoints));
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

  // Build tick marks every STEP (optional)
  const tickCount = Math.floor(maxPoints / STEP);

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
      <div className="flex items-center justify-between">
        <div className="font-semibold">
          <span className="ml-2 text-sm opacity-80">{label}</span>
        </div>
        <StatusBadge state={saveState} error={error} />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={maxPoints}
          step={STEP}
          value={value}
          onChange={(e) => {
            const raw = Number(e.target.value);
            const next = clampRound(raw, maxPoints);
            if (next !== value) setPopKey(Date.now()); // crisp “pop” on each step change
            setValue(next);
          }}
          disabled={disabled}
          className="w-full accent-current"
          aria-label={`Points for side ${side}`}
          list={`ticks-${side}-${gameId}`}
        />
        <div className="w-16 text-center text-2xl font-bold tabular-nums">
          {/* Remount on change to trigger snap animation */}
          <span key={popKey} className="inline-block animate-snap">{value}</span>
        </div>
      </div>

      <div className="flex justify-between text-xs opacity-80">
        <span>0</span>
        <span>{maxPoints}</span>
      </div>

      {/* Optional ticks (browser support varies) */}
      <datalist id={`ticks-${side}-${gameId}`}>
        {Array.from({ length: tickCount + 1 }, (_, i) => (
          <option key={i} value={i * STEP} />
        ))}
      </datalist>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Crisp “pop” animation for the number */}
      <style jsx>{`
        @keyframes snap {
          0%   { transform: scale(0.92); filter: saturate(0.9); }
          100% { transform: scale(1);    filter: saturate(1); }
        }
        .animate-snap {
          animation: snap 120ms ease-out;
          will-change: transform, filter;
        }
      `}</style>
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
