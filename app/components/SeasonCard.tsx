// app/components/SeasonCard.tsx
import Link from "next/link";
import { apiGetJson } from "../lib/api";
import { Season } from "../lib/types";
import { JSX } from "react";

async function fetchSeason(id: string | number): Promise<Season | null> {
  const res = await apiGetJson<Season>(`/seasons/${id}`).catch(() => null);
  return res ?? null;
}

function SeasonCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm animate-pulse">
      <div className="h-5 w-48 bg-neutral-200 rounded" />
      <div className="mt-2 h-3 w-56 bg-neutral-200 rounded" />
    </div>
  );
}

async function Impl({ seasonId }: { seasonId: string | number }) {
  const season = await fetchSeason(seasonId);

  if (!season) {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm text-neutral-500">Season not found.</div>
      </div>
    );
  }

  return (
    <Link
      href={`/seasons/${season.ID}`}
      className="block rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="font-semibold truncate">{season.Name ?? `Season #${season.ID}`}</div>
    </Link>
  );
}

// typed static `Skeleton`
type Comp = (p: { seasonId: string | number }) => Promise<JSX.Element>;
const SeasonCard = Object.assign(Impl as Comp, { Skeleton: SeasonCardSkeleton });
export default SeasonCard;
