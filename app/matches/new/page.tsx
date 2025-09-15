"use client";
import ScorePad from "@/app/components/ScorePad";
import { useState } from "react";

export default function NewMatchPage() {
  const [form, setForm] = useState({
    seasonId: "",
    type: "SINGLES",
    playedAt: new Date().toISOString(),
    participantIdsA: [] as string[],
    participantIdsB: [] as string[],
    teamAId: "",
    teamBId: ""
  });
  const [rounds, setRounds] = useState<any[]>([{ number: 1, twentiesA: 0, twentiesB: 0, scoreA: 0, scoreB: 0 }]);

  async function submit() {
    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        teamAId: form.teamAId || undefined,
        teamBId: form.teamBId || undefined,
        rounds
      })
    });
    if (!res.ok) return alert(`Error: ${await res.text()}`);
    window.location.href = "/dashboard";
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Record Match</h1>
      <div className="grid sm:grid-cols-2 gap-3">
        <input className="border rounded p-2" placeholder="Season ID" value={form.seasonId}
          onChange={(e) => setForm({ ...form, seasonId: e.target.value })} />
        <select className="border rounded p-2" value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="SINGLES">Singles</option>
          <option value="TEAMS">Teams</option>
        </select>
        <input className="border rounded p-2" type="datetime-local"
          value={form.playedAt.slice(0, 16)}
          onChange={(e) => setForm({ ...form, playedAt: new Date(e.target.value).toISOString() })} />
        <input className="border rounded p-2" placeholder="Team A ID (optional)" value={form.teamAId}
          onChange={(e) => setForm({ ...form, teamAId: e.target.value })} />
        <input className="border rounded p-2" placeholder="Team B ID (optional)" value={form.teamBId}
          onChange={(e) => setForm({ ...form, teamBId: e.target.value })} />
      </div>

      <ScorePad onChange={setRounds as any} />

      <div className="pt-2">
        <button className="rounded-xl px-4 py-2 border" onClick={submit}>Save Match</button>
      </div>
    </section>
  );
}
