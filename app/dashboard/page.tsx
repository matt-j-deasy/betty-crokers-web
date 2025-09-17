import StatCard from "../components/StatCard";

type Count = { count: number };

export default async function Dashboard() {
  const results = await Promise.allSettled<Count>([
  ]);

  const [players, teams, matches] = results.map((r) => {
    if (r.status === "fulfilled") return r.value.count;
    return null;
  });

  const anyFailed = results.some((r) => r.status === "rejected");

  const display = (n: number | null) => (n ?? "—");

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">League Dashboard</h1>

      {anyFailed && (
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-900 p-3 text-sm">
          Some stats are unavailable right now. Data shown may be partial.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Players" value={display(players)} />
        <StatCard label="Teams" value={display(teams)} />
        <StatCard label="Matches" value={display(matches)} />
      </div>
    </section>
  );
}
