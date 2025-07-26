import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreatorPageClient from "./CreatorPageClient";

interface Props {
  params: {
    idprofile: string;
    type: string;
  };
}

export default async function CreatorPage({ params }: Props) {
  const { idprofile, type } = params;

  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const profile = await prisma.profile.findUnique({
    where: { id: idprofile },
  });

  if (!profile || profile.type.toUpperCase() !== type.toUpperCase()) {
    return <p className="p-10 text-red-600">Perfil não encontrado.</p>;
  }

  return <CreatorPageClient profile={profile} sessionUser={session} />;
}
