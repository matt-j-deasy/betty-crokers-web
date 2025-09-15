
import { serverFetch } from "@/app/lib/api";
import { Match, Player } from "@/app/lib/types";

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const [player, recent] = await Promise.all([
    serverFetch<Player>(`/players/${params.id}`),
    serverFetch<Match[]>(`/players/${params.id}/recent-matches`)
  ]);

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">{player.displayName}</h1>
      <div className="text-sm opacity-70">{player.bio || "No bio set."}</div>
      <div>
        <h2 className="font-semibold mb-2">Recent Matches</h2>
        <ul className="space-y-2">
          {recent.map((m) => (
            <li key={m.id} className="border rounded-xl p-3 bg-white">
              <div className="text-sm">Played: {new Date(m.playedAt).toLocaleString()}</div>
              <div className="text-xs opacity-70">Rounds: {m.rounds.length}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
