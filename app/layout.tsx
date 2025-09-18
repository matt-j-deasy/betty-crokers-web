import "./globals.css";
import Providers from "@/app/components/Providers";
import SiteHeader from "@/app/components/SiteHeaderNav";

export const metadata = { title: "Crok America", description: "Crokinole Central" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50">
        <Providers>
          <SiteHeader />
          <main className="mx-auto max-w-6xl p-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
