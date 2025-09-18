// app/games/page.tsx
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { apiGetJson } from "@/app/lib/api";
import { Envelope, SessionWithUser } from "@/app/lib/types";
import GameCard from "@/app/components/GameCard";
import GameCreateForm from "./ui/GameCreateForm";

export const metadata = { title: "Games — Crok America" };

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Minimal shape we need to render GameCard
type GameSummary = { ID: number };

async function fetchGames(): Promise<GameSummary[]> {
  const payload = await apiGetJson<Envelope<GameSummary[]>>("/games").catch(() => ({
    data: [],
    total: 0,
    page: 1,
    size: 0,
  }));
  return payload.data;
}

async function GamesList() {
  const games = await fetchGames();

  if (games.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-neutral-600 bg-white">
        No games yet. Create the first one.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {games.map((g) => (
        <Suspense key={g.ID} fallback={<GameCard.Skeleton />}>
          <GameCard gameId={g.ID} />
        </Suspense>
      ))}
    </div>
  );
}

export default async function GamesPage() {
  const session: SessionWithUser | null = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "admin";

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Games</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="text-sm text-neutral-500">Loading games…</div>}>
            <GamesList />
          </Suspense>
        </div>

        {isAdmin && (
          <div className="lg:col-span-1">
            <GameCreateForm />
          </div>
        )}
      </div>
    </section>
  );
}
