import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PrismaClient, ProfileType } from "@/generated/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DeleteButton from "@/components/DeleteButton";
import { FaPlus } from "react-icons/fa";

const prisma = new PrismaClient();

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const profiles = await prisma.profile.findMany({
    where: {
      userId: session.user.id,
    },
  });

  const mentors = profiles.filter((p) => p.type === ProfileType.MENTOR);
  const mentees = profiles.filter((p) => p.type === ProfileType.MENTORADO);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header session={session} />

      <main className="flex-grow px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white shadow rounded-xl p-6">
            <p className="text-sm text-gray-500">Perfis Mentores</p>
            <h2 className="text-2xl font-bold text-blue-600">{mentors.length}</h2>
          </div>
          <div className="bg-white shadow rounded-xl p-6">
            <p className="text-sm text-gray-500">Perfis Mentorados</p>
            <h2 className="text-2xl font-bold text-purple-600">{mentees.length}</h2>
          </div>
          <div className="bg-white shadow rounded-xl p-6">
            <p className="text-sm text-gray-500">Total de Perfis</p>
            <h2 className="text-2xl font-bold text-black">{profiles.length}</h2>
          </div>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          {profiles.length > 0 ? (
            <>
              {mentors.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-xl font-semibold mb-3 text-blue-700">Perfis Mentor</h2>
                  <ul className="space-y-3">
                    {mentors.map((profile) => (
                      <li key={profile.id}>
                        <div className="flex justify-between items-center gap-4">
                          <Link
                            href={`/creator/${profile.type.toLowerCase()}/${profile.id}`}
                            className="flex-1 block border border-blue-200 rounded p-4 hover:bg-blue-50 transition"
                          >
                            <strong>{profile.profession}</strong>
                            <p className="text-gray-600 text-sm">{profile.description}</p>
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {mentees.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold mb-3 text-purple-700">Perfis Mentorado</h2>
                  <ul className="space-y-3">
                    {mentees.map((profile) => (
                      <li key={profile.id}>
                        <div className="flex justify-between items-center gap-4">
                          <Link
                            href={`/creator/${profile.type.toLowerCase()}/${profile.id}`}
                            className="flex-1 block border border-purple-200 rounded p-4 hover:bg-purple-50 transition"
                          >
                            <strong>{profile.profession}</strong>
                            <p className="text-gray-600 text-sm">{profile.description}</p>
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          ) : (
            <p className="text-gray-700">Você ainda não possui nenhum perfil.</p>
          )}
        </div>
      </main>

      <Footer />

      <Link
        href="/profile"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition z-50"
        title="Criar novo perfil"
      >
        <FaPlus className="text-xl" />
      </Link>
    </div>
  );
}
