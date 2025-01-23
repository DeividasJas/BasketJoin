export default function GameStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mx-auto mt-10 flex max-w-[900px] flex-col place-items-center rounded-md bg-zinc-900 px-2 py-6">
        {children}
      </div>
    </>
  );
}
