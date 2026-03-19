import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string;
        const password = credentials?.password as string;
        if (!username || !password) return null;

        const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

        try {
          if (apiUrl && apiUrl !== "local") {
            // Production: call PHP backend directly
            const res = await fetch(`${apiUrl}/api/utenti.php?action=login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username, password }),
            });

            if (!res.ok) return null;

            const user = await res.json();
            if (!user || !user.id) return null;

            return {
              id: String(user.id),
              name: user.nome || user.username,
              email: user.ruolo,
            };
          } else {
            // Local: call our own API endpoint
            const baseUrl =
              process.env.NEXTAUTH_URL ||
              process.env.AUTH_URL ||
              "http://localhost:3000";
            const res = await fetch(
              `${baseUrl}/api/utenti?action=login`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
              }
            );

            if (!res.ok) return null;

            const user = await res.json();
            if (!user || !user.id) return null;

            return {
              id: String(user.id),
              name: user.nome || user.username,
              email: user.ruolo,
            };
          }
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.ruolo = user.email;
        token.userId = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.email = token.ruolo as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session.user as any;
        user.ruolo = token.ruolo;
        user.userId = token.userId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
});
