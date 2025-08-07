// app/api/profile/[id]/description/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // ajuste o caminho conforme seu projeto

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const { description } = await req.json();

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return NextResponse.json(
        { error: 'Descrição inválida.' },
        { status: 400 }
      );
    }

    const updatedProfile = await prisma.profile.update({
      where: { id },
      data: { description },
    });

    return NextResponse.json(updatedProfile, { status: 200 });
  } catch (error) {
    console.error('[PUT /api/profile/[id]/description]', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar a descrição.' },
      { status: 500 }
    );
  }
}
