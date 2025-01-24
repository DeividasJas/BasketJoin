"use client";

export default function ProjectContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="mx-auto flex min-h-screen w-auto max-w-[1100px] flex-col border bg-inherit">
        {children}
      </main>
    </>
  );
}
