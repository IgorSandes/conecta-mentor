// src/app/api/calendar/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const { dateTime, mentoradoId, meetingLink, profileId } = await req.json();

  if (!dateTime || !mentoradoId || !profileId) {
    return NextResponse.json({ message: "Campos obrigatórios ausentes." }, { status: 400 });
  }

  // Busca o usuário autenticado e seus perfis
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profiles: true },
  });

  if (!user || !user.profiles.length) {
    return NextResponse.json({ message: "Usuário ou perfis não encontrados." }, { status: 404 });
  }

  // Verifica se o profileId enviado pertence ao usuário autenticado e é do tipo MENTOR
  const mentorProfile = user.profiles.find(p => p.id === profileId && p.type === "MENTOR");

  if (!mentorProfile) {
    return NextResponse.json({ message: "Perfil de mentor inválido ou não encontrado." }, { status: 403 });
  }

  // Verifica se o perfil do mentorado realmente existe
  const mentoradoProfile = await prisma.profile.findUnique({
    where: { id: mentoradoId },
  });

  if (!mentoradoProfile) {
    return NextResponse.json({ message: "Mentorado não encontrado." }, { status: 404 });
  }

  // Cria a nova sessão de mentoria
  const newSession = await prisma.calendar.create({
    data: {
      dateTime: new Date(dateTime), // converter para Date se necessário
      meetingLink,
      user: { connect: { id: user.id } },
      profile: { connect: { id: mentorProfile.id } },
      mentorado: { connect: { id: mentoradoProfile.id } },
    },
  });

  return NextResponse.json(newSession);
}
