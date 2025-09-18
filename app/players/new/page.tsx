// app/players/new/page.tsx
import Link from "next/link";
import AddPlayerForm from "./AddPlayerForm";

export const metadata = { title: "Add Player — Crok America" };

export default function NewPlayerPage() {
  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Add Player</h1>
        <Link href="/players" className="px-4 py-2 rounded-lg border bg-white hover:bg-neutral-50">
          Back to Players
        </Link>
      </header>

      <div className="rounded-xl border bg-white p-4">
        <AddPlayerForm />
      </div>
    </section>
  );
}
