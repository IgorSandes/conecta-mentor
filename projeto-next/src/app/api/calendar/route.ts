// src/app/api/calendar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const profileId = searchParams.get("profileId");
  const profileType = searchParams.get("profileType"); // novo parâmetro

  if (!profileId || !profileType) {
    return NextResponse.json({ message: "profileId e profileType são obrigatórios." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profiles: true },
  });

  const hasAccess = user?.profiles.some((p) => p.id === profileId);

  if (!hasAccess) {
    return NextResponse.json({ message: "Acesso não autorizado ao perfil." }, { status: 403 });
  }

  let calendar;

  if (profileType === "MENTOR") {
    calendar = await prisma.calendar.findMany({
      where: { profileId },
    });
  } else if (profileType === "MENTORADO") {
    calendar = await prisma.calendar.findMany({
      where: { mentoradoId: profileId },
    });
  } else {
    return NextResponse.json({ message: "Tipo de perfil inválido." }, { status: 400 });
  }

  return NextResponse.json(calendar);
}
