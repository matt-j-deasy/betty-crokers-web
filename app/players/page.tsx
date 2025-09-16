import { apiGetJson } from "@/app/lib/api";
import { Envelope, Player } from "@/app/lib/types";

export const metadata = { title: "Players — Betty Crockers" };

async function fetchPlayers(): Promise<Player[]> {
  const payload = await apiGetJson<Envelope<Player[]>>("/api/players").catch(() => ({
    data: [],
    total: 0,
    page: 1,
    size: 0,
  }));
  return payload.data;
}

export default async function PlayersPage() {
  const players = await fetchPlayers();

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Players</h1>
        <a
          href="/players/new"
          className="px-4 py-2 rounded-lg border bg-white hover:bg-neutral-50"
        >
          Add Player
        </a>
      </header>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 text-left text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-2">Nickname</th>
              <th className="px-4 py-2">Name</th>
              {/* Room for multi-team membership display later */}
              {/* <th className="px-4 py-2">Teams (this season)</th> */}
              <th className="px-4 py-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center opacity-70" colSpan={3}>
                  No players yet.
                </td>
              </tr>
            ) : (
              players.map((p) => {
                const name =
                  [p.FirstName ?? "", p.LastName ?? ""].join(" ").trim() || "—";
                const joined = p.CreatedAt
                  ? new Date(p.CreatedAt).toLocaleDateString()
                  : "—";
                return (
                  <tr key={p.ID} className="border-t hover:bg-neutral-50">
                    <td className="px-4 py-2 font-medium">{p.Nickname}</td>
                    <td className="px-4 py-2">{name}</td>
                    {/* <td className="px-4 py-2">{p.teams?.length ?? 0}</td> */}
                    <td className="px-4 py-2">{joined}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}