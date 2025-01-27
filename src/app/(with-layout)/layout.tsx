export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="pb-safe bg-zinc-300 p-4 shadow-xl shadow-zinc-300 dark:bg-zinc-900 dark:shadow-none xs:mx-auto xs:mt-4 xs:min-w-[75%] xs:rounded-md">
        {children}
      </main>
    </>
  );
}
