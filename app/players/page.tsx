import { apiGetJson } from "@/app/lib/api";
import { Envelope, Player, SessionWithUser } from "@/app/lib/types";
import { Suspense } from "react";
import PlayerCard from "../components/PlayerCard";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import PlayerCreateForm from "./ui/PlayerCreateForm";

export const metadata = { title: "Players — Crok America" };

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchPlayers(): Promise<Player[]> {
  const payload = await apiGetJson<Envelope<Player[]>>("/players").catch(() => ({
    data: [],
    total: 0,
    page: 1,
    size: 0,
  }));
  return payload.data;
}

async function PlayersList() {
  const players = await fetchPlayers();
  if (players.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-neutral-600 bg-white">
        No players yet. Create the first one.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {players.map((player) => (
        <Suspense key={player.ID} fallback={<PlayerCard.Skeleton />}>
          <PlayerCard playerId={player.ID} />
        </Suspense>
      ))}
    </div>
  );
}

export default async function PlayersPage() {
    const session: SessionWithUser | null = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === "admin";

  return (
      <section className="space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Players</h1>
        </header>
  
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="text-sm text-neutral-500">Loading players…</div>}>
              <PlayersList />
            </Suspense>
          </div>
  
          {isAdmin && (
            <div className="lg:col-span-1">
              <PlayerCreateForm />
            </div>
          )}
        </div>
      </section>
    );
}