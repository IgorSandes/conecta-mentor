"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { EventInput } from "@fullcalendar/core";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import "./calendar.css";

type CalendarProps = {
  profileId: string;
};

export default function Calendar({ profileId }: CalendarProps) {
  const [events, setEvents] = useState<EventInput[]>([]);

  useEffect(() => {
    if (!profileId) return;

    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/calendar/${profileId}`);
        const data = await res.json();

        const mappedEvents = data.map((item: any) => ({
          title: item.meetingLink || "Sessão de mentoria",
          date: item.dateTime.split("T")[0],
        }));

        setEvents(mappedEvents);
      } catch (error) {
        console.error("Erro ao buscar eventos:", error);
      }
    };

    fetchEvents();
  }, [profileId]);

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        locale={ptBrLocale}
      />
    </div>
  );
}
