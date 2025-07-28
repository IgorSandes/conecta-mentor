"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { EventInput } from "@fullcalendar/core";
import { FaTrash } from "react-icons/fa";

type ProfileType = "MENTOR" | "MENTORADO";

interface CalendarProps {
  profileId: string;
  profileType: ProfileType;
  refreshKey: number;
}

interface SessionEvent extends EventInput {
  meetingLink?: string;
}

export default function Calendar({ profileId, profileType, refreshKey }: CalendarProps) {
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const res = await fetch(`/api/calendar?profileId=${profileId}&profileType=${profileType}`);
        if (!res.ok) throw new Error("Erro ao carregar eventos");

        const data = await res.json();

        const formatted = data.map((session: any) => ({
          id: session.id,
          title: "Mentoria",
          start: session.dateTime,
          meetingLink: session.meetingLink,
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
  }, [profileId, profileType, refreshKey]);

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir essa sessão?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/calendar/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Erro ao excluir sessão");
      }

      // Remove o evento do estado local
      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (error) {
      alert("Falha ao excluir a sessão.");
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  }

  const renderEventContent = (eventInfo: any) => {
    const link = eventInfo.event.extendedProps.meetingLink;
    const startTime = new Date(eventInfo.event.start).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div
        className="flex items-center bg-gray-50 rounded p-2 cursor-pointer hover:bg-gray-100"
        style={{ gap: "0.25rem" }}
      >
        {/* Bolinha colorida à esquerda */}
        <div className="flex items-center w-6 justify-center">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: eventInfo.backgroundColor || "#3b82f6" }}
          />
        </div>

        {/* Conteúdo: título, horário e link */}
        <div className="flex flex-col flex-1 ml-2">
          <span className="font-semibold text-gray-900">Mentoria</span>
          <span className="text-gray-700 font-mono text-sm mt-1">Horário: {startTime}</span>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm mt-1"
              onClick={(e) => e.stopPropagation()}
            >
              Participar da sessão
            </a>
          )}
        </div>

        {/* Ícone de lixeira */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(eventInfo.event.id);
          }}
          disabled={deletingId === eventInfo.event.id}
          className="text-red-600 hover:text-red-800 p-1 rounded"
          title="Excluir sessão"
          aria-label="Excluir sessão"
          type="button"
        >
          <FaTrash size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h2 className="text-3xl text-center font-Arial m-4">Calendário de Sessões</h2>

      {loading ? (
        <h2 className="text-center">Carregando calendário...</h2>
      ) : (
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          locale={ptBrLocale}
          events={events}
          eventContent={renderEventContent}
          height="auto"
        />
      )}
    </div>
  );
}
