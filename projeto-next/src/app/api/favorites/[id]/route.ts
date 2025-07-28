import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const favoriteId = params.id;

  if (!favoriteId) {
    return NextResponse.json(
      { error: "ID do favorito é obrigatório." },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  try {
    // Busca o favorito para validar se pertence ao usuário logado
    const favorite = await prisma.favorite.findUnique({
      where: { id: favoriteId },
      include: {
        user: true,
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: "Favorito não encontrado." },
        { status: 404 }
      );
    }

    if (favorite.user.email !== session.user.email) {
      return NextResponse.json(
        { error: "Acesso não autorizado para remover este favorito." },
        { status: 403 }
      );
    }

    await prisma.favorite.delete({
      where: { id: favoriteId },
    });

    return NextResponse.json(
      { message: "Favorito removido com sucesso." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao remover favorito:", error);
    return NextResponse.json(
      { error: "Erro interno ao remover favorito." },
      { status: 500 }
    );
  }
}
