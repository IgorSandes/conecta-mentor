import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profiles: true },
    });

    // Verifica se existe ao menos um perfil
    if (!user || !user.id || !user.profiles || user.profiles.length === 0) {
      return NextResponse.json({ message: "Usuário ou perfil não encontrado." }, { status: 404 });
    }

    const profile = user.profiles[0]; // usa o primeiro perfil

    const body = await request.json();
    const { dateTime, mentoradoId, meetingLink } = body;

    if (!dateTime || !mentoradoId) {
      return NextResponse.json(
        { message: "dateTime e mentoradoId são obrigatórios." },
        { status: 400 }
      );
    }

    const newSession = await prisma.calendar.create({
      data: {
        dateTime: new Date(dateTime),
        mentoradoId,
        meetingLink: meetingLink || null,
        userId: user.id,
        profileId: profile.id,
      },
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar sessão:", error);
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}
