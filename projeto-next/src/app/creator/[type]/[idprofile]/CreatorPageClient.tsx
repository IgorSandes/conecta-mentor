'use client';

import { useState } from "react";
import { FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Calendar from "@/components/Calendar";
import { Session } from "next-auth";
import UsersList from "@/components/UsersList";
import AddedUsersList from "@/components/AddedUsersList";
import FormSession from "@/components/FormSession";
import DeleteButton from "@/components/DeleteButton";

import ChatsList from "@/components/ChatsList"; // importe o novo componente

type ProfileType = "MENTOR" | "MENTORADO";

interface Profile {
  id: string;
  type: ProfileType;
  profession: string;
  description: string;
}

interface CreatorPageClientProps {
  profile: Profile;
  sessionUser: Session;
}

export default function CreatorPageClient({ profile, sessionUser }: CreatorPageClientProps) {
  const [activeTab, setActiveTab] = useState<
    "inicio" | "sessoes" | "mensagem" | "minha-rede" | "configuracoes"
  >("inicio");
  const [showForm, setShowForm] = useState(false);
  const [refreshCalendar, setRefreshCalendar] = useState(0);

  function onCreateSuccess() {
    setRefreshCalendar((v) => v + 1);
    setShowForm(false);
  }
  function MensagensDelete() {
    return (
      <div className="p-4 bg-white rounded shadow">
        <h2>Deletar perfil</h2>
      </div>
    );
  }
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 flex-col md:flex-row">
        <aside
          className="
            bg-gray-950 text-white p-6 
            w-full md:w-64
            flex md:flex-col flex-row 
            items-center md:items-start 
            justify-between md:justify-start 
            gap-6 md:gap-8
            overflow-x-auto
            scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900
            "
        >
          <div className="text-2xl font-bold flex items-center gap-2 whitespace-nowrap flex-shrink-0">
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

          <nav className="flex md:flex-col flex-row gap-6 md:gap-4 text-lg flex-shrink-0">
            <ul className="flex md:flex-col flex-row gap-6 md:gap-4">
              {[
                { key: "inicio", label: "Início" },
                { key: "minha-rede", label: "Minha Rede" },
                { key: "sessoes", label: "Sessões" },
                { key: "mensagem", label: "Mensagens" },
                { key: "configuracoes", label: "Configurações" },
              ].map(({ key, label }) => (
                <li
                  key={key}
                  className={`cursor-pointer whitespace-nowrap ${activeTab === key ? "font-semibold" : ""
                    }`}
                  onClick={() => setActiveTab(key as any)}
                >
                  {label}
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="flex-1 bg-gray-100 p-4 sm:p-6 md:p-8 flex flex-col min-h-screen overflow-auto">
          <Header session={sessionUser} />

          <div className="flex-1 mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Perfil: <span className="text-blue-600">{profile.profession}</span>
            </h2>
            <p className="text-gray-700 leading-relaxed mb-8">
              <strong>Descrição:</strong> {profile.description}
            </p>

            {activeTab === "inicio" && (
              <UsersList
                loggedUserId={sessionUser.user.id}
                loggedUserProfileId={profile.id}
                loggedUserProfileType={profile.type}
                loggedUserProfession={profile.profession}
              />
            )}

            {activeTab === "minha-rede" && (
              <AddedUsersList
                loggedUserProfileId={profile.id}
                loggedUserId={sessionUser.user.id}
              />
            )}

            {activeTab === "sessoes" && (
              <>
                {profile.type === "MENTOR" && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Nova Sessão
                    </button>
                  </div>
                )}

                {showForm && (
                  <FormSession
                    profileId={profile.id}
                    onSuccess={onCreateSuccess}
                    onClose={() => setShowForm(false)}
                  />
                )}

                <Calendar
                  profileId={profile.id}
                  profileType={profile.type}
                  refreshKey={refreshCalendar}
                />
              </>
            )}

            {activeTab === "mensagem" && (
              <ChatsList loggedUserProfileId={profile.id} />
            )}

            {activeTab === "configuracoes" && (
              <div className="bg-white rounded-lg shadow-md p-6 w-full">
                <h3 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">
                  Configurações do perfil
                </h3>

                <div className="flex items-center justify-between w-full">
                  <div className="mr-4 flex-grow">
                    <MensagensDelete />
                  </div>
                  <DeleteButton id={profile.id} />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
