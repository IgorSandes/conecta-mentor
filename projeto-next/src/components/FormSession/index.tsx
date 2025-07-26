"use client";

import { useState, FormEvent } from "react";

interface FormSessionProps {
  mentoradoProfiles: { id: string; profession: string }[]; // lista para selecionar mentorado
  onCreate?: () => void; // callback após criar
}

export default function FormSession({ mentoradoProfiles, onCreate }: FormSessionProps) {
  const [dateTime, setDateTime] = useState("");
  const [mentoradoId, setMentoradoId] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!dateTime || !mentoradoId) {
        setError("Por favor, preencha todos os campos obrigatórios.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/calendar/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateTime,
          mentoradoId,
          meetingLink,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erro ao criar sessão.");
      }

      setDateTime("");
      setMentoradoId("");
      setMeetingLink("");
      if (onCreate) onCreate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md p-4 bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-semibold mb-4">Criar nova sessão</h2>

      {error && <p className="text-red-600">{error}</p>}

      <div>
        <label htmlFor="dateTime" className="block font-medium mb-1">
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
        <label htmlFor="mentorado" className="block font-medium mb-1">
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
              {p.profession}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="meetingLink" className="block font-medium mb-1">
          Link da reunião (opcional)
        </label>
        <input
          id="meetingLink"
          type="url"
          placeholder="https://exemplo.com/reuniao"
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Criar Sessão"}
      </button>
    </form>
  );
}
