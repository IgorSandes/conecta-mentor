import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import GitHubProvider from "next-auth/providers/github";
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
  useSession as nextAuthUseSession,
  getSession as nextAuthGetSession,
} from "next-auth/react";

import { resend } from "./resend";
import WelcomeEmail from "@/emails/WelcomeEmail";
import { render } from "@react-email/render";

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  pages: {
    signIn: "/", // rota de login customizada
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },

    // Remova a lógica de envio aqui se quiser usar só o evento createUser
    // async signIn({ user }) {
    //   return true;
    // },
  },

  events: {
    createUser: async ({ user }) => {
      try {
        if (!user.email) return;

        const html = await render(
          <WelcomeEmail userName={user.name || "Mentor(a)"} />
        );

        await resend.emails.send({
          from: "Conecta Mentor <onboarding@resend.dev>", // domínio de teste Resend
          to: user.email,
          subject: "Boas-vindas à Conecta Mentor!",
          html,
        });

        console.log("E-mail de boas-vindas enviado para:", user.email);
      } catch (err) {
        console.error("Erro ao enviar e-mail de boas-vindas:", err);
      }
    },
  },
};

// Autenticação para SSR
export async function auth() {
  return await getServerSession(authOptions);
}

// Exportações para uso client
export const signIn = nextAuthSignIn;
export const signOut = nextAuthSignOut;
export const useSession = nextAuthUseSession;
export const getSession = nextAuthGetSession;
