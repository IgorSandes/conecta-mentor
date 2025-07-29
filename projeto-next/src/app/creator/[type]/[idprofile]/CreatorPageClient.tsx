"use client";

import { useState } from "react";
import { FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Calendar from "@/components/Calendar";
import { Session } from "next-auth";
import UsersList from "@/components/UsersList";
import AddedUsersList from "@/components/AddedUsersList";
import FormSession from "@/components/FormSession";

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

function MensagensTeste() {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-xl font-semibold mb-2">Mensagens (em desenvolvimento)</h3>
      <p>Este componente ainda não está pronto.</p>
    </div>
  );
}

export default function CreatorPageClient({ profile, sessionUser }: CreatorPageClientProps) {
  const [activeTab, setActiveTab] = useState<"inicio" | "sessoes" | "mensagem" | "minha-rede">("inicio");
  const [showForm, setShowForm] = useState(false);
  const [refreshCalendar, setRefreshCalendar] = useState(0);

  function onCreateSuccess() {
    setRefreshCalendar((v) => v + 1);
    setShowForm(false);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row flex-1">
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
              <li
                className={`hover: cursor-pointer ${
                  activeTab === "inicio" ? " font-semibold" : ""
                }`}
                onClick={() => setActiveTab("inicio")}
              >
                Início
              </li>
              <li
                className={`hover: cursor-pointer ${
                  activeTab === "minha-rede" ? " font-semibold" : ""
                }`}
                onClick={() => setActiveTab("minha-rede")}
              >
                Minha Rede
              </li>
              <li
                className={`hover: cursor-pointer ${
                  activeTab === "sessoes" ? " font-semibold" : ""
                }`}
                onClick={() => setActiveTab("sessoes")}
              >
                Sessões
              </li>
              <li
                className={`hover: cursor-pointer ${
                  activeTab === "mensagem" ? " font-semibold" : ""
                }`}
                onClick={() => setActiveTab("mensagem")}
              >
                Mensagens
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 bg-gray-100 p-6 md:p-8 flex flex-col min-h-screen">
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

            {activeTab === "mensagem" && <MensagensTeste />}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
