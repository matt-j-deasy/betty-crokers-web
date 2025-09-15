// lib/auth.ts
import { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

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

        // MUST have GO_SERVER_URL set
        console.log('process.env.GO_SERVER_URL', process.env.GO_SERVER_URL);
        const res = await fetch(`${process.env.GO_SERVER_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: creds.email, password: creds.password })
        });

        if (!res.ok) return null;
        const { token, user } = await res.json();
        if (!token || !user) return null;

        return { ...user, token }; // token carried into jwt callback
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as any).id;
        token.token = (user as any).token;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).id = token.uid;
      (session as any).token = token.token;
      return session;
    }
  },
  pages: { signIn: "/login" } 
};
