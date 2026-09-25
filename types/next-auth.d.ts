import { Role, PreferredLanguage } from "@prisma/client";
import { type DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      preferredLanguage: PreferredLanguage;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: Role;
    preferredLanguage?: PreferredLanguage;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    preferredLanguage?: PreferredLanguage;
  }
}
