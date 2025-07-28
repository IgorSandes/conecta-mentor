import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        profiles: {
          select: {
            id: true,
            type: true,
            profession: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários com perfis:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários com perfis" },
      { status: 500 }
    );
  }
}
