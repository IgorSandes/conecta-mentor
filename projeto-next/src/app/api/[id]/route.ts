// Arquivo: app/api/profile/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const profile = await prisma.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno ao buscar perfil" },
      { status: 500 }
    );
  }
}
