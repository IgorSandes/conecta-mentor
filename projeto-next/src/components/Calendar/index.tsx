// components/Calendar.tsx
"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";

type ProfileType = "MENTOR" | "MENTORADO";

interface CalendarProps {
  profileId: string;
  profileType: ProfileType;
  refreshKey: number; // <- nova prop para forçar recarregamento
}

interface SessionEvent {
  id: string;
  title: string;
  start: string;
}

export default function Calendar({ profileId, profileType, refreshKey }: CalendarProps) {
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const res = await fetch(`/api/calendar?profileId=${profileId}&profileType=${profileType}`);
        if (!res.ok) throw new Error("Erro ao carregar eventos");

        const data = await res.json();

        const formatted = data.map((session: any) => ({
          id: session.id,
          title: session.title || "Sessão de Mentoria",
          start: session.dateTime,
        }));

        setEvents(formatted);
      } catch (error) {
        console.error("Erro ao carregar calendário:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [profileId, profileType, refreshKey]); // <- inclui refreshKey como dependência

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Calendário de Sessões</h2>

      {loading ? (
        <h2>Carregando calendário...</h2>
      ) : (
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          locale={ptBrLocale}
          events={events}
          height="auto"
        />
      )}
    </div>
  );
}
