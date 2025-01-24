"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { AllGames } from "@/types/user";
import listPlugin from "@fullcalendar/list";
import { useEffect, useState } from "react";
// import CalendarModal from "./calendarModal";


export default function GameCalendar({
  allGames,
  user_id,
}: {
  allGames: AllGames;
  user_id: string;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [initialView, setInitialView] = useState("dayGridMonth");
  useEffect(() => {
    setIsMounted(true);
    setInitialView(window.innerWidth < 768 ? "listYear" : "dayGridMonth");
  }, []);

  const handleWindowResize = (arg: any) => {
    const calendarApi = arg.view.calendar;
    if (window.innerWidth < 768) {
      calendarApi.changeView("listYear");
    } else {
      calendarApi.changeView("dayGridMonth");
    }
  };

  if (!allGames || !isMounted) return null;

  return (
    <FullCalendar
      plugins={[listPlugin, dayGridPlugin]}
      initialView={initialView}
      showNonCurrentDates={false}
      windowResize={handleWindowResize}
      height={600}
      firstDay={1}
      events={allGames.map((game: any) => ({
        title: game.location.name,
        date: game.game_date,
        game_id: game.id,
        isActive: game.game_registrations.some(
          (registration: any) => registration.user_id === user_id,
        ),
      }))}
      headerToolbar={{
        start: "dayGridMonth,listYear",
        center: "title",
        end: "prev,today,next",
      }}
      eventColor=""
      displayEventTime={true}
      eventTimeFormat={{
        hour: "numeric",
        minute: "2-digit",
        omitZeroMinute: true,
        meridiem: "short",
      }}
      eventContent={(eventInfo) => {
        // return <CalendarModal eventInfo={eventInfo} />;
        return (
          <div>
            <p>{eventInfo.event.title}</p>
            {/* <p>{eventInfo.event.start}</p> */}
          </div>
        );
      }}
    />
  );
}
