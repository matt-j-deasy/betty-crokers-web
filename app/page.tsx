export default function Home() {
  return (
    <main className="min-h-[70vh] grid place-items-center p-8">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-4xl font-bold">The Betty Crockers</h1>
        <p className="text-lg opacity-80">
          Recreational Crokinole league. Track players, seasons, teams, scores, and stats.
        </p>
        <a href="/login" className="inline-block rounded-xl px-4 py-2 border">
          Sign in
        </a>
      </div>
    </main>
  );
}
