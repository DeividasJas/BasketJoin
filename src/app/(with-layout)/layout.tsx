export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="pb-safe bg-zinc-900 p-4 xs:mx-auto xs:mt-4 xs:min-w-[75%] xs:rounded-md">
        {children}
      </main>
    </>
  );
}
