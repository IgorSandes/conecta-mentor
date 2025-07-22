# 🧠 Plataforma de Mentoria

A **Plataforma de Mentoria** é uma aplicação web que conecta pessoas com experiência no mercado de trabalho (mentores) a pessoas que estão começando sua trajetória profissional (mentorados). O objetivo é criar uma rede colaborativa de troca de experiências, conselhos e desenvolvimento mútuo.

## ✨ Funcionalidades

- Cadastro e autenticação de usuários
- Criação de perfis como **Mentor** e/ou **Mentorado**
- Listagem de perfis disponíveis para conexão
- Sistema escalável de perfis (um usuário pode ter múltiplos papéis)
- Interface moderna e responsiva

## 💠 Tecnologias Utilizadas

- [**Next.js**](https://nextjs.org/) – Framework React para SSR e API Routes
- [**TypeScript**](https://www.typescriptlang.org/) – Tipagem estática para maior confiabilidade
- [**PostgreSQL**](https://www.postgresql.org/) – Banco de dados relacional robusto
- [**Prisma**](https://www.prisma.io/) – ORM para comunicação com o banco de dados
- [**NextAuth.js**](https://next-auth.js.org/) – Autenticação segura e integrada ao Next.js

## 📁 Estrutura do Projeto

```bash
.
├── app/                # Páginas e rotas do Next.js
├── components/         # Componentes reutilizáveis
├── lib/                # Instâncias do Prisma e Auth
├── prisma/             # Esquema do banco de dados
├── public/             # Arquivos estáticos
├── styles/             # Estilos globais
├── types/              # Tipagens personalizadas
└── README.md
```

## 🔐 Autenticação

A autenticação é feita com o **NextAuth.js**, permitindo login seguro e gerenciamento de sessão. Está configurado com suporte a múltiplos provedores, podendo ser facilmente adaptado para Google, GitHub, etc.

## 🧹 ORM & Banco de Dados

O Prisma é utilizado para mapear os modelos `User` e `Profile`, permitindo que um mesmo usuário tenha múltiplos perfis (Mentor e/ou Mentorado).

```prisma
model User {
  id        String    @id @default(cuid())
  name      String
  email     String    @unique
  profiles  Profile[]
  ...
}

model Profile {
  id          String   @id @default(cuid())
  type        String   // MENTOR | MENTORADO
  profession  String
  description String
  user        User     @relation(fields: [userId], references: [id])
  userId      String
}
```

## 🚀 Como rodar localmente

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/mentoria-app.git
cd mentoria-app

# Instale as dependências
npm install

# Crie o arquivo .env e configure as variáveis de ambiente
cp .env.example .env

# Rode as migrações do banco
npx prisma migrate dev

# Inicie o servidor de desenvolvimento
npm run dev
```

## 📌 Implementações Futuras

- Implementação de chat.
- Criação de sessões com integração a plataformas de streaming como Microsoft Teams, Google Meet, entre outras.

Feito por [Igor Sandes Brun](https://github.com/igorsandes)

