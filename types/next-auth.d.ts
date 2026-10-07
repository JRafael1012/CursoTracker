import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rol: string;
      centroId: number;
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    rol?: string;
    centroId?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    rol?: string;
    centroId?: number;
  }
}
