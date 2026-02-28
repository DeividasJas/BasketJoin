"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { AllGames } from "@/types/user";
import listPlugin from "@fullcalendar/list";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp, CircleOff } from "lucide-react";

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
        .fc {
          --fc-border-color: rgb(228 228 231);
          --fc-button-bg-color: transparent;
          --fc-button-border-color: rgb(228 228 231);
          --fc-button-hover-bg-color: rgb(244 244 245);
          --fc-button-hover-border-color: rgb(212 212 216);
          --fc-button-active-bg-color: rgb(24 24 27);
          --fc-button-active-border-color: rgb(24 24 27);
          --fc-button-text-color: rgb(113 113 122);
          --fc-today-bg-color: rgba(251, 146, 60, 0.06);
          font-size: 0.8125rem;
        }

        .fc .fc-toolbar-title {
          font-size: 0.9375rem;
          font-weight: 600;
          color: rgb(24 24 27);
        }

        .fc .fc-button {
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
          padding: 0.375rem 0.75rem;
          text-transform: capitalize;
          box-shadow: none !important;
        }

        .fc .fc-button-primary:not(:disabled):active,
        .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: rgb(24 24 27);
          border-color: rgb(24 24 27);
          color: white;
        }

        .fc .fc-col-header-cell-cushion {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: rgb(161 161 170);
          padding: 0.5rem 0;
        }

        .fc .fc-daygrid-day-number {
          font-size: 0.75rem;
          padding: 0.375rem;
          color: rgb(113 113 122);
        }

        .fc .fc-day-today .fc-daygrid-day-number {
          color: rgb(251 146 60);
          font-weight: 600;
        }

        .dark .fc {
          --fc-border-color: rgb(39 39 42);
          --fc-button-bg-color: transparent;
          --fc-button-border-color: rgb(63 63 70);
          --fc-button-hover-bg-color: rgb(39 39 42);
          --fc-button-hover-border-color: rgb(82 82 91);
          --fc-button-active-bg-color: rgb(244 244 245);
          --fc-button-active-border-color: rgb(244 244 245);
          --fc-button-text-color: rgb(161 161 170);
          --fc-today-bg-color: rgba(251, 146, 60, 0.08);
        }

        .dark .fc .fc-toolbar-title {
          color: rgb(244 244 245);
        }

        .dark .fc .fc-button-primary:not(:disabled):active,
        .dark .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: rgb(244 244 245);
          border-color: rgb(244 244 245);
          color: rgb(24 24 27);
        }

        .dark .fc .fc-view-harness {
          background-color: transparent;
        }

        .dark .fc .fc-col-header-cell,
        .dark .fc .fc-daygrid-day {
          background-color: transparent;
          color: rgb(244 244 245);
        }

        .dark .fc .fc-col-header-cell-cushion {
          color: rgb(113 113 122);
        }

        .dark .fc .fc-daygrid-day-number {
          color: rgb(161 161 170);
        }

        .dark .fc .fc-day-today .fc-daygrid-day-number {
          color: rgb(251 146 60);
        }

        .dark .fc .fc-list {
          background-color: transparent;
          border-color: rgb(39 39 42);
        }

        .dark .fc .fc-list-day-cushion {
          background-color: rgb(39 39 42);
          color: rgb(244 244 245);
        }

        .dark .fc .fc-list-event:hover td {
          background-color: rgb(39 39 42);
        }

        .dark .fc .fc-list-event-time,
        .dark .fc .fc-list-event-title {
          color: rgb(228 228 231);
        }

        @media (max-width: 640px) {
          .fc .fc-toolbar {
            flex-direction: column;
            gap: 0.375rem;
          }

          .fc .fc-toolbar-chunk {
            display: flex;
            justify-content: center;
          }

          .fc .fc-button {
            padding: 0.25rem 0.5rem;
            font-size: 0.6875rem;
          }

          .fc .fc-toolbar-title {
            font-size: 0.875rem;
          }

          .fc .fc-list-event {
            font-size: 0.8125rem;
          }

          .fc .fc-list-event-time {
            white-space: normal;
          }
        }

        .fc-list-event-dot {
          border-width: 5px !important;
          border-radius: 50%;
        }

        .fc-daygrid-event {
          border-radius: 0.375rem;
          padding: 0;
          margin: 1px 2px !important;
          min-height: 28px;
          border: none !important;
        }

        .fc-daygrid-event-harness {
          margin: 1px 0 !important;
        }

        .fc-event-main {
          padding: 0 !important;
          min-height: inherit;
        }

        .dark .fc .fc-list-event-dot {
          opacity: 0.9;
        }

        @media (max-width: 640px) {
          .fc-list-event {
            padding: 0.375rem 0;
          }

          .fc-list-event-dot {
            border-width: 6px !important;
          }
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
              ? "#16a34a"
              : game.status === "CANCELLED"
                ? "#dc2626"
                : "#3b82f6",
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

          let borderColor, bgColor, Icon;

          if (status === "CANCELLED") {
            borderColor = "#ef4444";
            bgColor = "rgba(239, 68, 68, 0.12)";
            Icon = CircleOff;
          } else if (isUserRegistered) {
            borderColor = "#22c55e";
            bgColor = "rgba(34, 197, 94, 0.12)";
            Icon = ThumbsUp;
          } else {
            borderColor = "#3b82f6";
            bgColor = "rgba(59, 130, 246, 0.12)";
            Icon = null;
          }

          return (
            <div
              className="h-full w-full cursor-pointer overflow-hidden px-2 py-1 text-xs"
              style={{
                borderLeft: `3px solid ${borderColor}`,
                backgroundColor: bgColor,
                borderRadius: "0 0.25rem 0.25rem 0",
              }}
            >
              <div className="flex items-center gap-1 truncate font-medium">
                {Icon && (
                  <Icon className="h-2.5 w-2.5 flex-shrink-0 opacity-80" />
                )}
                <span className="truncate text-[11px]">
                  {eventInfo.event.title}
                </span>
              </div>
              <div className="truncate text-[10px] opacity-60">
                {eventInfo.timeText}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
