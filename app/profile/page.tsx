import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";

export const metadata = { title: "Your Profile — Crok America" };

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <section className="p-6">
        <h1 className="text-xl font-bold">Not signed in</h1>
        <p>Please <a href="/login" className="underline">login</a>.</p>
      </section>
    );
  }

  const user = session.user as any;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Your Profile</h1>
      <div className="rounded-xl border bg-white p-4 space-y-2">
        <div><strong>Name:</strong> {user.name}</div>
        <div><strong>Email:</strong> {user.email}</div>
        <div><strong>Role:</strong> {user.role ?? "USER"}</div>
      </div>
    </section>
  );
}
