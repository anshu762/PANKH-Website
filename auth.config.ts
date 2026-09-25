import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        if (user.id) token.id = user.id;
        if (user.role) token.role = user.role;
        if (user.preferredLanguage) token.preferredLanguage = user.preferredLanguage;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        if (token.id) session.user.id = token.id;
        if (token.role) session.user.role = token.role;
        if (token.preferredLanguage) session.user.preferredLanguage = token.preferredLanguage;
      }
      return session;
    },
  },
  providers: [],
};
