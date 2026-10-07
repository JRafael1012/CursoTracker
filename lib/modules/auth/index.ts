import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.usuario.findFirst({
          where: { email, estado: "activo" },
        });
        if (!user) return null;

        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: String(user.id),
          name: user.nombre,
          email: user.email,
          rol: user.rol,
          centroId: user.centroId,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = (user as { rol: string }).rol;
        token.centroId = (user as { centroId: number }).centroId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.rol = token.rol as string;
      session.user.centroId = token.centroId as number;
      return session;
    },
  },
});
