"use client";
import { useState } from "react";

type Round = { number: number; twentiesA: number; twentiesB: number; scoreA: number; scoreB: number };

export default function ScorePad({ onChange }: { onChange: (rounds: Round[]) => void }) {
  const [rounds, setRounds] = useState<Round[]>([{ number: 1, twentiesA: 0, twentiesB: 0, scoreA: 0, scoreB: 0 }]);

  function update(i: number, patch: Partial<Round>) {
    const next = rounds.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    setRounds(next);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {rounds.map((r, i) => (
        <div key={r.number} className="grid grid-cols-5 gap-2 items-end border rounded-xl p-3 bg-white">
          <div className="text-sm">Round {r.number}</div>
          <input className="border rounded p-2" type="number" min={0} value={r.twentiesA}
            onChange={(e) => update(i, { twentiesA: Number(e.target.value) })} placeholder="20s A" />
          <input className="border rounded p-2" type="number" min={0} value={r.twentiesB}
            onChange={(e) => update(i, { twentiesB: Number(e.target.value) })} placeholder="20s B" />
          <input className="border rounded p-2" type="number" value={r.scoreA}
            onChange={(e) => update(i, { scoreA: Number(e.target.value) })} placeholder="Net A" />
          <input className="border rounded p-2" type="number" value={r.scoreB}
            onChange={(e) => update(i, { scoreB: Number(e.target.value) })} placeholder="Net B" />
        </div>
      ))}
      <div className="flex gap-2">
        <button type="button" className="border rounded px-3 py-2" onClick={() => {
          const n = rounds.length + 1;
          const next = [...rounds, { number: n, twentiesA: 0, twentiesB: 0, scoreA: 0, scoreB: 0 }];
          setRounds(next); onChange(next);
        }}>+ Round</button>
        <button type="button" className="border rounded px-3 py-2" onClick={() => {
          const next = rounds.slice(0, -1); setRounds(next); onChange(next);
        }} disabled={rounds.length <= 1}>- Round</button>
      </div>
    </div>
  );
}
