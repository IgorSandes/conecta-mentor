// src/app/api/calendar/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profiles: true },
  });

  if (!user || !user.id || !user.profiles || user.profiles.length === 0) {
    return NextResponse.json({ message: "Usuário ou perfil não encontrado." }, { status: 404 });
  }

  const profileId = user.profiles[0].id;

  const calendar = await prisma.calendar.findMany({
    where: { profileId },
  });

  return NextResponse.json(calendar);
}
