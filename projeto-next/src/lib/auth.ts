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
      // Inclui o id do usuário no objeto session.user
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

// Função para usar no lado do servidor (SSR) para pegar sessão
export async function auth() {
  return await getServerSession(authOptions);
}

// Reexportar funções client do next-auth/react
export const signIn = nextAuthSignIn;
export const signOut = nextAuthSignOut;
export const useSession = nextAuthUseSession;
export const getSession = nextAuthGetSession;
