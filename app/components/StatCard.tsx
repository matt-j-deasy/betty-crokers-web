export default function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm opacity-70">{label}</div>
      <div className="text-3xl font-semibold">{value}</div>
    </div>
  );
}
