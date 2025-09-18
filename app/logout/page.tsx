// app/logout/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import Logout from "./Logout";

export const metadata = { title: "Signing out…" };

export default async function LogoutPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <Logout />;
}
