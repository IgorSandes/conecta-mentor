"use client";

import { useState, useEffect } from "react";
import { FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Deshboard from "@/components/deshboard";
import Calendar from "@/components/Calendar";
import { Session } from "next-auth";

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

interface Mentorado {
  id: string;
  label: string;
}

function MensagensTeste() {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-xl font-semibold mb-2">Mensagens (em desenvolvimento)</h3>
      <p>Este componente ainda não está pronto.</p>
    </div>
  );
}

function FormSession({
  onClose,
  onSuccess,
  mentoradoProfiles,
  profileId,
}: {
  onClose: () => void;
  onSuccess: () => void;
  mentoradoProfiles: Mentorado[];
  profileId: string;
}) {
  const [dateTime, setDateTime] = useState("");
  const [mentoradoId, setMentoradoId] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!dateTime || !mentoradoId) {
      setError("Por favor, preencha os campos obrigatórios.");
      setLoading(false);
      return;
    }

    try {
      // Formata para ISO 8601 completo (com segundos e timezone UTC)
      const formattedDateTime = new Date(dateTime).toISOString();

      const res = await fetch("/api/calendar/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateTime: formattedDateTime,
          mentoradoId,
          meetingLink,
          profileId, // ✅ Passando o profileId
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao criar sessão");
      }

      setDateTime("");
      setMentoradoId("");
      setMeetingLink("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow max-w-md">
      <h2 className="text-xl font-semibold mb-4">Criar nova sessão</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1" htmlFor="dateTime">
            Data e hora <span className="text-red-600">*</span>
          </label>
          <input
            id="dateTime"
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1" htmlFor="mentorado">
            Mentorado <span className="text-red-600">*</span>
          </label>
          <select
            id="mentorado"
            value={mentoradoId}
            onChange={(e) => setMentoradoId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Selecione o mentorado</option>
            {mentoradoProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1" htmlFor="meetingLink">
            Link da reunião (opcional)
          </label>
          <input
            id="meetingLink"
            type="url"
            placeholder="https://link-da-reuniao.com"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Criar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreatorPageClient({ profile, sessionUser }: CreatorPageClientProps) {
  const [activeTab, setActiveTab] = useState<"inicio" | "sessoes" | "mensagem">("inicio");
  const [showForm, setShowForm] = useState(false);
  const [refreshCalendar, setRefreshCalendar] = useState(0);
  const [mentoradoProfiles, setMentoradoProfiles] = useState<Mentorado[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMentorados() {
      setLoadingProfiles(true);
      setError(null);

      try {
        const res = await fetch("/api/mentorados");
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Erro ao buscar mentorados.");
        }

        const data = await res.json();
        const formattedMentorados = data.map((mentorado: any) => ({
          id: mentorado.id,
          label: `${mentorado.userName} - ${mentorado.profession}`,
        }));

        setMentoradoProfiles(formattedMentorados);
      } catch (err: any) {
        setError(err.message || "Erro ao buscar mentorados.");
      } finally {
        setLoadingProfiles(false);
      }
    }

    if (profile && profile.type === "MENTOR") {
      fetchMentorados();
    }
  }, [profile]);

  function onCreateSuccess() {
    setRefreshCalendar((v) => v + 1);
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
                className={`hover:underline cursor-pointer ${activeTab === "inicio" ? "underline font-semibold" : ""
                  }`}
                onClick={() => setActiveTab("inicio")}
              >
                Início
              </li>
              <li
                className={`hover:underline cursor-pointer ${activeTab === "sessoes" ? "underline font-semibold" : ""
                  }`}
                onClick={() => setActiveTab("sessoes")}
              >
                Sessões
              </li>
              <li
                className={`hover:underline cursor-pointer ${activeTab === "mensagem" ? "underline font-semibold" : ""
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

            {activeTab === "inicio" && <Deshboard />}

            {activeTab === "sessoes" && (
              <>
                {profile.type === "MENTOR" && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Criar Sessão
                    </button>
                  </div>
                )}

                {showForm && (
                  <FormSession
                    mentoradoProfiles={mentoradoProfiles}
                    onClose={() => setShowForm(false)}
                    onSuccess={onCreateSuccess}
                    profileId={profile.id} // ✅ enviado aqui também
                  />
                )}

                <Calendar
                  profileId={profile.id}
                  profileType={profile.type}
                  refreshKey={refreshCalendar} // <-- isso faltava
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
