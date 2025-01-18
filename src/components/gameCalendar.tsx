"use client";
import FullCalendar from "@fullcalendar/react"; // React wrapper
import dayGridPlugin from "@fullcalendar/daygrid"; // Plugin for day grid view
import { AllGames } from "@/types/user";

export default function GameCalendar({ allGames }: { allGames: AllGames }) {
  const handleWindowResize = (arg: any) => {
    const calendarApi = arg.view.calendar;
    if (window.innerWidth < 768) {
      calendarApi.changeView("dayGridWeek"); // Change to list view for smaller screens
    } else {
      calendarApi.changeView("dayGridMonth"); // Change to month view for larger screens
    }
  };
  if (!allGames) return null;
  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin]}
        // initialView="dayGridMonth"
        initialView="dayGridMonth"
        showNonCurrentDates={false}
        windowResize={handleWindowResize}
        height={500}
        firstDay={1}
        // titleFormat={{ year: 'numeric', month: 'long' }} // Maintain title format
        // dateClick={handleDateClick}
        // editable={true} // Allows event drag-and-drop
        events={allGames.map((game) => {
          console.log(game);

          return {
            title: game.location.name,
            date: game.game_date,
            // className: "bg-[rgb(159,89,46)] ",
          };
        })}
        // eventColor='red'
        // eventBackgroundColor="transparent"
        // eventClassNames={["bg-[rgb(159,89,46)], text-zinc-300"]}
        // eventBorderColor="transparent"
        // eventTextColor="red"
        // eventDisplay=""
        // weekends={false}
        // dayHeaders={true}
        // navLinks={true}
        headerToolbar={{
          start: "title",
          center: "",
          end: "prev,today,next",
        }}
        eventColor=""
        // eventBackgroundColor="red"
        // eventBorderColor="rgb(159,89,46)"
        displayEventTime={true}
        eventTimeFormat={{
          hour: "numeric",
          minute: "2-digit",
          // omitZeroMinute: false,
          // meridiem: 'short',
        }}
        // eventMouseEnter={(info) => {
        //   info.el.style.backgroundColor = "yellow";
        //   info.el.style.borderColor = "yellow";
        // }}
        // eventMouseLeave={(info) => {
        //   info.el.style.backgroundColor = "transparent";
        //   info.el.style.borderColor = "rgb(159,89,46)";
        // }}
      />
      <style jsx>{`
        .fc-event:hover {
          background-color: blue !important;
          border-color: blue !important;
        }
      `}</style>
    </>
  );
}
