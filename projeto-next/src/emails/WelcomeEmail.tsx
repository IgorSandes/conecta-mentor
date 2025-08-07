import React from 'react';
import { Html, Head, Preview, Body, Container, Text } from '@react-email/components';

type WelcomeEmailProps = {
  userName: string;
};

export default function WelcomeEmail({ userName }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bem-vindo(a) ao Conecta Mentor!</Preview>
      <Body style={{ fontFamily: 'Arial', backgroundColor: '#f4f4f4', padding: '20px' }}>
        <Container style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '8px' }}>
          <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>
            Olá {userName},
          </Text>
          <Text style={{ fontSize: '16px' }}>
            Seja muito bem-vindo(a) ao <strong>Conecta Mentor</strong>! Estamos animados em ter você com a gente.
          </Text>
          <Text style={{ fontSize: '14px', color: '#888' }}>
            Equipe Conecta Mentor
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
