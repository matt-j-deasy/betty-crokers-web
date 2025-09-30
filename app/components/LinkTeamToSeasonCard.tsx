"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

type Season = {
  ID: string;
  LeagueID: string;
  Name: string;
  StartsOn: string;
  EndsOn: string;
  Timezone: string;
  Description?: string | null;
};

export default function LinkTeamToSeasonCard({
  teamId,
  allSeasons,
  linkedSeasonIds,
}: {
  teamId: number;
  allSeasons: Season[];
  linkedSeasonIds: Set<string>;
}) {
  const available = useMemo(
    () => allSeasons.filter((s) => !linkedSeasonIds.has(s.ID)),
    [allSeasons, linkedSeasonIds]
  );
  const [seasonId, setSeasonId] = useState<string>(available[0]?.ID ?? "");


  async function linkAction(fd: FormData) {
     const seasonId = fd.get("seasonId");
     const body = { teamId, seasonId: Number(seasonId) };
     try {
       const res = await fetch("/api/team-seasons", {
         method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
       });
       if (!res.ok) {
         const errPayload = await res.json().catch(() => null);
         throw new Error(errPayload?.error || `Failed to link team to season: ${res.status}`);
       }
       // Success - clear selection
       setSeasonId("");
       // Optionally, you might want to refresh the page or update state to reflect the new link
       // For example, you could call a prop function passed down to refresh the parent component's data
     } catch (error: any) {
       alert(error?.message || "An unexpected error occurred");
     }
    }
  
  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="font-medium mb-2">Link this team to a season</h3>
      {available.length === 0 ? (
        <p className="text-sm text-neutral-600">
          This team is already linked to all seasons.
        </p>
      ) : (
        <form
          action={(fd) => {
            // Populate fields expected by the server action
            fd.set("teamId", String(teamId));
            fd.set("seasonId", seasonId);
            return linkAction(fd);
          }}
          className="space-y-3"
        >
          <label className="block text-sm">
            <span className="text-neutral-700">Season</span>
            <select
              value={seasonId}
              onChange={(e) => setSeasonId(e.target.value)}
              className="mt-1 block w-full rounded-lg border px-3 py-2"
            >
              {available.map((s) => (
                <option key={s.ID} value={s.ID}>
                  {s.Name}
                </option>
              ))}
            </select>
          </label>
          <SubmitButton />
        </form>
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm bg-neutral-900 text-white disabled:opacity-60"
    >
      {pending ? "Linking…" : "Link Season"}
    </button>
  );
}
