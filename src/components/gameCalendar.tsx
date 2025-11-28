"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { AllGames } from "@/types/user";
import listPlugin from "@fullcalendar/list";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GameCalendar({
  allGames,
  user_id,
}: {
  allGames: AllGames;
  user_id: string;
}) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [initialView, setInitialView] = useState("dayGridMonth");

  useEffect(() => {
    setIsMounted(true);
    setInitialView(window.innerWidth < 640 ? "listMonth" : "dayGridMonth");
  }, []);

  const handleWindowResize = (arg: any) => {
    const calendarApi = arg.view.calendar;
    if (window.innerWidth < 640) {
      calendarApi.changeView("listMonth");
    } else {
      calendarApi.changeView("dayGridMonth");
    }
  };

  if (!allGames || !isMounted) return null;

  return (
    <div className="calendar-wrapper">
      <style jsx global>{`
        /* Base calendar styling */
        .fc {
          --fc-border-color: rgb(228 228 231);
          --fc-button-bg-color: rgb(212 212 216);
          --fc-button-border-color: rgb(161 161 170);
          --fc-button-hover-bg-color: rgb(161 161 170);
          --fc-button-hover-border-color: rgb(113 113 122);
          --fc-button-active-bg-color: rgb(63 63 70);
          --fc-button-active-border-color: rgb(39 39 42);
          --fc-button-text-color: rgb(24 24 27);
          --fc-today-bg-color: rgba(59, 130, 246, 0.1);
        }

        /* Dark mode styling */
        .dark .fc {
          --fc-border-color: rgb(39 39 42);
          --fc-button-bg-color: rgb(39 39 42);
          --fc-button-border-color: rgb(63 63 70);
          --fc-button-hover-bg-color: rgb(63 63 70);
          --fc-button-hover-border-color: rgb(82 82 91);
          --fc-button-active-bg-color: rgb(82 82 91);
          --fc-button-active-border-color: rgb(113 113 122);
          --fc-button-text-color: rgb(250 250 250);
          --fc-today-bg-color: rgba(59, 130, 246, 0.15);
        }

        /* Dark mode calendar background */
        .dark .fc .fc-view-harness {
          background-color: rgb(24 24 27);
        }

        .dark .fc .fc-col-header-cell,
        .dark .fc .fc-daygrid-day {
          background-color: rgb(24 24 27);
          color: rgb(250 250 250);
        }

        .dark .fc .fc-daygrid-day-number {
          color: rgb(212 212 216);
        }

        .dark .fc .fc-list {
          background-color: rgb(24 24 27);
          border-color: rgb(39 39 42);
        }

        .dark .fc .fc-list-day-cushion {
          background-color: rgb(39 39 42);
          color: rgb(250 250 250);
        }

        .dark .fc .fc-list-event:hover td {
          background-color: rgb(39 39 42);
        }

        .dark .fc .fc-list-event-time,
        .dark .fc .fc-list-event-title {
          color: rgb(250 250 250);
        }

        /* Mobile optimizations */
        @media (max-width: 640px) {
          .fc .fc-toolbar {
            flex-direction: column;
            gap: 0.5rem;
          }

          .fc .fc-toolbar-chunk {
            display: flex;
            justify-content: center;
          }

          .fc .fc-button {
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
          }

          .fc .fc-toolbar-title {
            font-size: 1.125rem;
          }

          .fc .fc-list-event {
            font-size: 0.875rem;
          }

          .fc .fc-list-event-time {
            white-space: normal;
          }
        }

        /* Improve button styling */
        .fc .fc-button-primary:not(:disabled):active,
        .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: var(--fc-button-active-bg-color);
          border-color: var(--fc-button-active-border-color);
        }
      `}</style>
      <FullCalendar
        plugins={[listPlugin, dayGridPlugin]}
        initialView={initialView}
        showNonCurrentDates={false}
        windowResize={handleWindowResize}
        height="auto"
        contentHeight="auto"
        firstDay={1}
      events={allGames.map((game: any) => {
        const isUserRegistered = game.game_registrations.some(
          (registration: any) =>
            registration.user_id === user_id &&
            registration.status === "CONFIRMED",
        );
        const registrationCount = game.game_registrations.filter(
          (r: any) => r.status === "CONFIRMED",
        ).length;

        return {
          id: game.id.toString(),
          title: `${game.location.name} (${registrationCount}/${game.max_players || "∞"})`,
          date: game.game_date,
          extendedProps: {
            game_id: game.id,
            isUserRegistered,
            location: game.location.name,
            registrationCount,
            maxPlayers: game.max_players,
            status: game.status,
          },
          backgroundColor: isUserRegistered
            ? "#16a34a" // green for registered
            : game.status === "CANCELLED"
              ? "#dc2626" // red for cancelled
              : "#3b82f6", // blue for available
          borderColor: isUserRegistered
            ? "#15803d"
            : game.status === "CANCELLED"
              ? "#b91c1c"
              : "#2563eb",
        };
      })}
      headerToolbar={{
        start: "dayGridMonth,listMonth",
        center: "title",
        end: "prev,today,next",
      }}
      displayEventTime={true}
      eventTimeFormat={{
        hour: "numeric",
        minute: "2-digit",
        omitZeroMinute: true,
        meridiem: "short",
      }}
      eventClick={(info) => {
        const gameId = info.event.extendedProps.game_id;
        router.push(`/game-status/${gameId}`);
      }}
      eventContent={(eventInfo) => {
        const { isUserRegistered, status } = eventInfo.event.extendedProps;
        return (
          <div className="cursor-pointer overflow-hidden px-1 py-0.5 text-xs">
            <div className="flex items-center gap-1 truncate font-semibold">
              {isUserRegistered && <span>✓</span>}
              {status === "CANCELLED" && <span>✗</span>}
              <span className="truncate">{eventInfo.event.title}</span>
            </div>
            <div className="truncate text-[10px] opacity-90">
              {eventInfo.timeText}
            </div>
          </div>
        );
      }}
    />
    </div>
  );
}
