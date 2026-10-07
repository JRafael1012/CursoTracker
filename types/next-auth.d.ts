import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rol: string;
      centroId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    rol: string;
    centroId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    rol: string;
    centroId: string | null;
  }
}