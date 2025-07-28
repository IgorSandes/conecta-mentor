"use client";

import { useEffect, useState } from "react";

interface FormSessionProps {
  profileId: string;
  onSuccess: () => void;
  onClose: () => void;
}

interface MentoradoFavorite {
  id: string;
  userName: string;
  profile: {
    id: string;
    type: string;
    profession: string;
    description: string;
  };
}

export default function FormSession({ profileId, onSuccess, onClose }: FormSessionProps) {
  const [mentoradoFavorites, setMentoradoFavorites] = useState<MentoradoFavorite[]>([]);
  const [mentoradoId, setMentoradoId] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch(`/api/favorites?userProfileId=${profileId}`);
        const data = await response.json();

        const filteredData = data.filter(
          (fav: MentoradoFavorite) => fav.profile.type === "MENTORADO"
        );

        setMentoradoFavorites(filteredData);
      } catch (err) {
        console.error("Erro ao buscar favoritos:", err);
      }
    };

    if (profileId) {
      fetchFavorites();
    }
  }, [profileId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!dateTime || !mentoradoId) {
      setError("Por favor, preencha os campos obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      const formattedDateTime = new Date(dateTime).toISOString();

      const res = await fetch("/api/calendar/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateTime: formattedDateTime,
          mentoradoId,
          meetingLink,
          profileId,
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
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto space-y-6"
    >
      {error && (
        <p className="text-red-600 bg-red-100 border border-red-300 rounded px-4 py-2">
          {error}
        </p>
      )}

      <div>
        <label
          htmlFor="mentorado"
          className="block text-gray-700 font-semibold mb-2"
        >
          Selecionar mentorado favorito
        </label>
        <select
          id="mentorado"
          value={mentoradoId}
          onChange={(e) => setMentoradoId(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     transition duration-200 ease-in-out"
          required
        >
          <option value="">Selecione um mentorado</option>
          {mentoradoFavorites.map((fav) => (
            <option key={fav.profile.id} value={fav.profile.id}>
              {fav.userName} - {fav.profile.profession}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="dateTime"
          className="block text-gray-700 font-semibold mb-2"
        >
          Data e horário
        </label>
        <input
          type="datetime-local"
          id="dateTime"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     transition duration-200 ease-in-out"
          required
        />
      </div>

      <div>
        <label
          htmlFor="meetingLink"
          className="block text-gray-700 font-semibold mb-2"
        >
          Link da reunião (opcional)
        </label>
        <input
          type="url"
          id="meetingLink"
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
          placeholder="https://..."
          className="w-full border border-gray-300 rounded-md px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     transition duration-200 ease-in-out"
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-500 text-white px-5 py-2 rounded-md
                     hover:bg-gray-600 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-md
                     hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Criando..." : "Criar sessão"}
        </button>
      </div>
    </form>
  );
}
