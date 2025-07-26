import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const mentorados = await prisma.profile.findMany({
      where: {
        type: "MENTORADO",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true, // opcional
            id: true,
          },
        },
      },
    });

    if (!mentorados || mentorados.length === 0) {
      return NextResponse.json({ message: "Nenhum mentorado encontrado" }, { status: 404 });
    }

    // Mapeia para retornar apenas o necessário (id, profissão e nome do usuário)
    const formatted = mentorados.map((mentorado) => ({
      id: mentorado.id,
      profession: mentorado.profession,
      description: mentorado.description,
      userName: mentorado.user?.name || "Sem nome",
      userId: mentorado.user?.id,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Erro ao buscar mentorados:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
