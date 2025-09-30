"use client";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status !== "authenticated") {
    return <Link href="/login">Login</Link>;
  }

  const user = session.user as any;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full overflow-hidden border"
      >
        {user?.image ? (
          <Image
            src={user?.image || "/avatar-default.png"}
            alt="avatar"
            className="w-full h-full object-cover"
            width={32}
            height={32}
            unoptimized
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/avatar-default.png";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-md border bg-white shadow-lg z-50">
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
