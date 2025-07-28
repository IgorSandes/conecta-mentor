import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface FavoriteWithRelations {
  id: string;
  userId: string;
  userProfileId: string;
  favoriteId: string;
  createdAt: Date;
  favorite: {
    id: string;
    type: string;
    profession: string;
    description: string;
    user: {
      id: string;
      name: string | null;
    };
  };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userProfileId = searchParams.get("userProfileId");

    if (!userProfileId) {
      return NextResponse.json(
        { error: "Parâmetro userProfileId é obrigatório." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profiles: true },
    });

    if (!user || !user.profiles.some((p) => p.id === userProfileId)) {
      return NextResponse.json({ message: "Acesso não autorizado." }, { status: 403 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userProfileId },
      include: {
        favorite: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const typedFavorites = favorites as FavoriteWithRelations[];

    const result = typedFavorites.map((fav) => ({
      id: fav.id,
      userName: fav.favorite.user?.name || "Usuário sem nome",
      profile: {
        id: fav.favorite.id,
        type: fav.favorite.type,
        profession: fav.favorite.profession,
        description: fav.favorite.description,
      },
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Erro na API favorites GET:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, userProfileId, favoriteId } = body;

    if (!userId || !userProfileId || !favoriteId) {
      return NextResponse.json(
        { error: "Parâmetros userId, userProfileId e favoriteId são obrigatórios." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.id !== userId) {
      return NextResponse.json({ message: "Acesso não autorizado." }, { status: 403 });
    }

    const favorite = await prisma.favorite.create({
      data: { userId, userProfileId, favoriteId },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error: any) {
    if (
      error.code === "P2002" &&
      error.meta?.target?.includes("userProfileId_favoriteId")
    ) {
      return NextResponse.json(
        { error: "Este perfil já foi favoritado por este perfil do usuário." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Parâmetro id do favorito é obrigatório." },
        { status: 400 }
      );
    }

    const favorite = await prisma.favorite.findUnique({
      where: { id },
    });

    if (!favorite) {
      return NextResponse.json({ error: "Favorito não encontrado." }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.id !== favorite.userId) {
      return NextResponse.json({ message: "Acesso não autorizado." }, { status: 403 });
    }

    await prisma.favorite.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Favorito removido com sucesso." });
  } catch (error: any) {
    console.error("Erro na API favorites DELETE:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}
