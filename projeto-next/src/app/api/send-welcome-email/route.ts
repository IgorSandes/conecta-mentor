import React from 'react';
import { render } from '@react-email/render';
import WelcomeEmail from '@/emails/WelcomeEmail';
import { resend } from '@/lib/resend';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { to, userName } = await req.json();

    // Use React.createElement ao invés de JSX para evitar erros de JSX em .ts
    const element = React.createElement(WelcomeEmail, { userName });

    const html = render(element);

    const fullHtml = `<!DOCTYPE html><html><body>${html}</body></html>`;

    const data = await resend.emails.send({
      from: 'Conecta Mentor <onboarding@conecta-mentor.dev>',
      to,
      subject: 'Bem-vindo(a) ao Conecta Mentor!',
      html: fullHtml,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return NextResponse.json({ success: false, error: String(error) });
  }
}
