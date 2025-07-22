import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Deshboard from "@/components/deshboard";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{
    idprofile: string;
    type: string;
  }>;
}

export default async function CreatorPage({ params }: Props) {
  // Aguarda o objeto params para pegar os valores
  const { idprofile, type } = await params;

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

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar */}
        <aside className="bg-gray-950 text-white p-6 md:w-64 w-full flex md:flex-col flex-row items-center md:items-start justify-between md:justify-start gap-6 md:gap-8">
          <div className="text-2xl font-bold flex items-center gap-2 whitespace-nowrap">
            {profile.type === "MENTOR" ? (
              <>
                MENTOR <FaChalkboardTeacher className="text-blue-600 text-xl" />
              </>
            ) : (
              <>
                MENTORADO <FaUserGraduate className="text-blue-600 text-xl" />
              </>
            )}
          </div>

          <nav>
            <ul className="flex md:flex-col gap-6 md:gap-4 text-lg">
              <li className="hover:underline cursor-pointer">
                <a href="/home">Início</a>
              </li>
              <li className="hover:underline cursor-pointer">Sessões</li>
              <li className="hover:underline cursor-pointer">Mensagens</li>
            </ul>
          </nav>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 bg-gray-100 p-6 md:p-8 flex flex-col min-h-screen">
          <Header session={session} />

          <div className="flex-1 mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Perfil: <span className="text-blue-600">{profile.profession}</span>
            </h2>
            <p className="text-gray-700 leading-relaxed mb-8">
              <strong>Descrição:</strong> {profile.description}
            </p>

            <Deshboard />
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
