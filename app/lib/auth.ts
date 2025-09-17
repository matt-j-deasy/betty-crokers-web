import { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const isServer = typeof window === "undefined";
const SERVER_API_BASE = process.env.SERVER_API_BASE!;
const PUBLIC_API_BASE  = process.env.NEXT_PUBLIC_API_BASE!;

// Helper to pick correct base
function apiBase() {
  return isServer ? SERVER_API_BASE : PUBLIC_API_BASE;
}

/**
 * We copy selected fields from Go response into the NextAuth JWT.
 * - token.goToken: the raw JWT from Go
 * - token.goTokenExp: ms epoch of expiry (from expiresAt)
 * - token.uid, token.name, token.email, token.role, token.image: normalized user fields
 */
export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  session: { strategy: "jwt" },
  providers: [
    Credentials({
  name: "Credentials",
  credentials: { email: { }, password: { } },
  async authorize(creds) {
    if (!creds?.email || !creds?.password) return null;

    // Server-side call to API
    const url = `${apiBase()}/auth/login`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: creds.email, password: creds.password }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const goToken: string | undefined = data?.token;
    const expiresAtStr: string | undefined = data?.expiresAt;
    const u = data?.user ?? {};
    if (!goToken || !u) return null;

    return {
      id: String(u.ID),
      email: String(u.Email),
      name: String(u.Name),
      role: u.Role ? String(u.Role) : "user",
      image: u.Image ? String(u.Image) : null,
      goToken,
      goTokenExp: expiresAtStr ? new Date(expiresAtStr).getTime() : undefined,
    } as any;
  },
})
  ],
callbacks: {
  async jwt({ token, user }) {
    // Initial sign-in
    if (user) {
      token.uid = (user as any).id;
      token.email = (user as any).email;
      token.name = (user as any).name;
      token.role = (user as any).role;
      token.image = (user as any).image;

      token.goToken = (user as any).goToken;
      token.goTokenExp = (user as any).goTokenExp;
      token.expired = false; // clear any prior flag
    }

    // If our upstream token expired, mark but keep token shape
    if (token.goTokenExp && Date.now() > Number(token.goTokenExp)) {
      token.goToken = undefined;
      token.expired = true;
    }

    return token; // <- IMPORTANT: return the enriched token, not a new bare object
  },

  async session({ session, token }) {
    session.user = {
      ...session.user,
      id: token.uid as string,
      email: token.email as string,
      name: (token.name as string) ?? session.user?.name ?? null,
      image: (token.image as string) ?? null,
      role: (token.role as string) ?? "user",
    } as any;

    (session as any).token = token.goToken as string | undefined;
    (session as any).tokenExpiresAt = token.goTokenExp as number | undefined;
    (session as any).expired = (token as any).expired === true;

    return session;
  },

  // Clamp redirect targets to same-origin / relative only
  async redirect({ url, baseUrl }) {
    if (url.startsWith("/")) return baseUrl + url; // relative OK
    try {
      const u = new URL(url);
      if (u.origin === baseUrl) return url;       // same-origin OK
    } catch {}
    return baseUrl;                                // otherwise clamp
  },
},
pages: { signIn: "/login" },
  events: {}
};
