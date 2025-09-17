import "./globals.css";
import Providers from "@/app/components/Providers";
import Link from "next/link";
import UserMenu from "@/app/components/UserMenu";

export const metadata = { title: "Betty Crockers", description: "Crokinole League" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50">
        {/* Providers must wrap the *entire app* */}
        <Providers>
          <header className="border-b bg-white">
            <div className="mx-auto max-w-6xl p-4 flex items-center justify-between">
              <Link href="/" className="font-semibold">Betty Crockers</Link>
              <nav className="flex items-center gap-4 text-sm">
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/matches/new">Score</Link>
                <Link href="/players">Players</Link>
                <Link href="/teams">Teams</Link>
                <Link href="/leagues">Leagues</Link>
                <Link href="/seasons">Seasons</Link>
                <Link href="/games">Games</Link>
                <UserMenu />
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl p-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
