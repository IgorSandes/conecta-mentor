// Arquivo: app/api/profile/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { type, profession, description } = await request.json();

  if (
    !type ||
    !profession ||
    !description ||
    (type !== "MENTOR" && type !== "MENTORADO")
  ) {
    return NextResponse.json(
      { error: "Dados inválidos ou incompletos" },
      { status: 400 }
    );
  }

  const newProfile = await prisma.profile.create({
    data: {
      userId: session.user.id,
      type,
      profession,
      description,
    },
  });

  return NextResponse.json(newProfile, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
  }

  const profile = await prisma.profile.findUnique({
    where: { id },
  });

  if (!profile || profile.userId !== session.user.id) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  await prisma.profile.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Perfil deletado com sucesso" });
}
