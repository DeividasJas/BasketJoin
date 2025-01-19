"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { AllGames } from "@/types/user";
import listPlugin from "@fullcalendar/list";
import { useEffect, useState } from "react";
import CalendarModal from "./calendarModal";

export default function GameCalendar({ allGames }: { allGames: AllGames }) {
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

  console.log("allgames", allGames);

  return (
    <FullCalendar
      plugins={[listPlugin, dayGridPlugin]}
      initialView={initialView}
      showNonCurrentDates={false}
      windowResize={handleWindowResize}
      height={600}
      firstDay={1}
      events={allGames.map((game) => ({
        title: game.location.name,
        date: game.game_date,
        game_id: game.id,
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
        console.log("eventInfo", eventInfo);
        return <CalendarModal eventInfo={eventInfo} />;
      }}
      // eventClick={(info) => {
      //   console.log(info);
      // }}
      // eventContent={(eventInfo) => {
      //   return (
      //     <div style={{ color: "blue", fontWeight: "bold" }}>
      //       🏀 {eventInfo.event.title}
      //     </div>
      //   );
      // }}
    />
  );
}

// <FullCalendar
//       plugins={[listPlugin, dayGridPlugin]}
//       // initialView="dayGridMonth"
//       initialView={initialView}
//       showNonCurrentDates={false}
//       // windowResize={handleWindowResize}
//       height={500}
//       firstDay={1}
//       // titleFormat={{ year: 'numeric', month: 'long' }} // Maintain title format
//       // dateClick={handleDateClick}
//       // editable={true} // Allows event drag-and-drop
//       events={allGames.map((game) => {
//         return {
//           title: game.location.name,
//           date: game.game_date,
//           // className: "bg-[rgb(159,89,46)] ",
//         };
//       })}
//       // eventColor='red'
//       // eventBackgroundColor="transparent"
//       // eventClassNames={["bg-[rgb(159,89,46)], text-zinc-300"]}
//       // eventBorderColor="transparent"
//       // eventTextColor="red"
//       // eventDisplay=""
//       // weekends={false}
//       // dayHeaders={true}
//       // navLinks={true}
//       // noEventsClassNames={"bg-red-200"}
//       noEventsContent={"No games scheduled"}
//       headerToolbar={{
//         // start: "dayGridMonth,listMonth",
//         start: "",
//         center: "title",
//         end: "prev,today,next",
//       }}
//       // eventColor=""
//       // eventBackgroundColor="red"
//       // eventBorderColor="rgb(159,89,46)"
//       displayEventTime={true}
//       eventTimeFormat={{
//         hour: "numeric",
//         minute: "2-digit",
//         omitZeroMinute: false,
//         meridiem: 'short',
//       }}
//       // eventMouseEnter={(info) => {
//       //   info.el.style.backgroundColor = "yellow";
//       //   info.el.style.borderColor = "yellow";
//       // }}
//       // eventMouseLeave={(info) => {
//       //   info.el.style.backgroundColor = "transparent";
//       //   info.el.style.borderColor = "rgb(159,89,46)";
//       // }}
//     />
