import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Tipagem correta do context para rotas dinâmicas no app router
interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = context.params;

  try {
    const profile = await prisma.profile.findUnique({
      where: { id }
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
