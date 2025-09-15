import Providers from "./components/Providers";
import "./globals.css";
import Link from "next/link";

export const metadata = { title: "Betty Crockers", description: "Crokinole League" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl p-4 flex items-center justify-between">
            <Link href="/" className="font-semibold">Betty Crockers</Link>
            <nav className="space-x-4 text-sm">
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/matches/new">Score</Link>
              <Link href="/login">Login</Link>
            </nav>
          </div>
        </header>
        <Providers>
          <main className="mx-auto max-w-6xl p-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}