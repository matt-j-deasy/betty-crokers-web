import { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

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
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;

        const res = await fetch(`${process.env.GO_SERVER_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: creds.email, password: creds.password })
        });

        if (!res.ok) return null;

        // Payload shape:
        // {
        //   expiresAt: "2025-09-15T22:13:16Z",
        //   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
        //   user: { ID, Email, Name, PasswordHash, Role, Image, CreatedAt, UpdatedAt }
        // }
        const data = await res.json();

        const goToken: string | undefined = data?.token;
        const expiresAtStr: string | undefined = data?.expiresAt;
        const u = data?.user ?? {};

        if (!goToken || !u) return null;

        const normalizedUser = {
          id: String(u.ID),
          email: String(u.Email),
          name: String(u.Name),
          role: u.Role ? String(u.Role) : "user",
          image: u.Image ? String(u.Image) : null
        };

        const goTokenExpMs = expiresAtStr ? new Date(expiresAtStr).getTime() : undefined;

        // Return fields we want to promote into the JWT on first sign-in
        return {
          ...normalizedUser,
          goToken,
          goTokenExp: goTokenExpMs
        } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, copy from "user" (what authorize returned)
      if (user) {
        token.uid = (user as any).id;
        token.email = (user as any).email;
        token.name = (user as any).name;
        token.role = (user as any).role;
        token.image = (user as any).image;

        token.goToken = (user as any).goToken;
        token.goTokenExp = (user as any).goTokenExp;
      }

      // enforce expiration from your Go token
      if (token.goTokenExp && Date.now() > Number(token.goTokenExp)) {
        // Invalidate session if expired
        return {
          // keep minimal info; removing goToken essentially signs user out on next request
          expired: true
        } as any;
      }

      return token;
    },
    async session({ session, token }) {
      // Attach normalized user fields
      session.user = {
        ...session.user,
        id: token.uid as string,
        email: token.email as string,
        name: (token.name as string) ?? session.user?.name ?? null,
        image: (token.image as string) ?? null,
        // expose role to the UI
        role: (token.role as string) ?? "user"
      } as any;

      // Attach access token + expiry for your fetchers/UI
      (session as any).token = token.goToken as string | undefined;
      (session as any).tokenExpiresAt = token.goTokenExp as number | undefined;
      (session as any).expired = (token as any).expired === true;

      return session;
    }
  },
  pages: { signIn: "/login" },
  events: {}
};
