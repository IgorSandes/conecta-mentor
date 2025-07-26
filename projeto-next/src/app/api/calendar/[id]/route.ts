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
