// app/logout/Logout.tsx
"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function Logout() {
  useEffect(() => {
    // Redirect to /login after the session cookie is cleared
    signOut({ callbackUrl: "/login", redirect: true });
  }, []);

  return (
    <div className="min-h-[50vh] grid place-items-center">
      <div className="text-sm text-neutral-600">Signing you out…</div>
    </div>
  );
}
