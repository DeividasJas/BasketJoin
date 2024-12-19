export default function ProfileDashboardLayout({
  stats,
  profile,
  gameHistory,
}: {
  stats: React.ReactNode;
  profile: React.ReactNode;
  gameHistory: React.ReactNode;
}) {
  return (
    <>
      <div className="mt-6 flex w-full flex-col gap-2 p-1 sm:grid sm:grid-cols-2">
        {/* <div className="border-4 ">{children}</div> */}
        {/* stats section */}

        <section className="rounded-md border border-zinc-600 px-2 py-2 shadow-md shadow-zinc-800 focus:border-[rgb(150,91,54)] sm:min-w-full">
          {stats}
        </section>
        {/* profile section */}

        <section className="rounded-md border border-zinc-600 px-2 py-2 shadow-md shadow-zinc-800 focus:border-[rgb(150,91,54)] sm:min-w-full">
          {profile}
        </section>

        {/* game section */}
        <section className="rounded-md border border-zinc-600 px-1 shadow-md shadow-zinc-800 hover:border-[rgb(150,91,54)] sm:min-w-full">
          {gameHistory}
        </section>
      </div>
    </>
  );
}
