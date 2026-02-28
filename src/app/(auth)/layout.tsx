import ThemeChanger from "@/components/themeChangeBtn";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeChanger />
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
        {children}
      </div>
    </>
  );
}
