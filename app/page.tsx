export default function Home() {
  return (
    <main className="min-h-[70vh] grid place-items-center p-8">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-4xl font-bold">Crok America</h1>
        <p className="text-lg opacity-80">
          The only thing casual about crokers is their 20s.
        </p>
        <a href="/login" className="inline-block rounded-xl px-4 py-2 border">
          Sign in
        </a>
      </div>
    </main>
  );
}
