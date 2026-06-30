import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Buscamos el usuario de forma nativa con Prisma
        const user = await db.usuario.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.activo) return null;

        // En producción usar bcrypt para comparar passwords encriptadas
        if (user.password !== credentials.password) return null;

        return {
          id: String(user.id),
          name: user.nombre,
          email: user.email,
          role: user.rol,
        };
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
  },
});
