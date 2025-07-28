// src/app/api/calendar/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const profileId = params.id;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profiles: true },
  });

  // Garante que esse profile pertence ao usuário autenticado
  const isProfileOwnedByUser = user?.profiles.some((p) => p.id === profileId);
  if (!isProfileOwnedByUser) {
    return NextResponse.json({ message: "Acesso não autorizado." }, { status: 403 });
  }

  // Busca sessões onde o perfil é mentor OU mentorado
  const calendar = await prisma.calendar.findMany({
    where: {
      OR: [
        { profileId },     // perfil como mentor (criador)
        { mentoradoId: profileId }, // perfil como mentorado (participante)
      ],
    },
    orderBy: { dateTime: "asc" },
  });

  return NextResponse.json(calendar);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const calendarId = params.id;

  // Antes de deletar, é interessante garantir que o evento pertence a um perfil do usuário
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profiles: true },
  });

  if (!user) {
    return NextResponse.json({ message: "Usuário não encontrado." }, { status: 404 });
  }

  // Busca o evento para verificar se o usuário pode deletar
  const event = await prisma.calendar.findUnique({
    where: { id: calendarId },
  });

  if (!event) {
    return NextResponse.json({ message: "Evento não encontrado." }, { status: 404 });
  }

  // Verifica se o evento está relacionado a algum perfil do usuário
  const userProfileIds = user.profiles.map((p) => p.id);
  if (!userProfileIds.includes(event.profileId) && !userProfileIds.includes(event.mentoradoId)) {
    return NextResponse.json({ message: "Acesso não autorizado." }, { status: 403 });
  }

  // Deleta o evento
  await prisma.calendar.delete({
    where: { id: calendarId },
  });

  return NextResponse.json({ message: "Evento deletado com sucesso." });
}
