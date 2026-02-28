import ThemeChanger from "@/components/themeChangeBtn";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeChanger />

      {/* Full-bleed immersive background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base layer */}
        <div className="absolute inset-0 bg-stone-50 dark:bg-[#080604]" />

        {/* Warm radial glow — dark mode */}
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 30%, rgba(232,93,4,0.1), transparent)",
          }}
        />

        {/* Warm radial glow — light mode */}
        <div
          className="absolute inset-0 block dark:hidden"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 25%, rgba(255,186,8,0.07), transparent)",
          }}
        />

        {/* Concentric court arcs */}
        <svg
          className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2"
          width="900"
          height="900"
          viewBox="0 0 900 900"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="450"
            cy="450"
            r="140"
            stroke="#E85D04"
            strokeWidth="0.8"
            className="opacity-[0.06] dark:opacity-[0.08]"
          />
          <circle
            cx="450"
            cy="450"
            r="260"
            stroke="#E85D04"
            strokeWidth="0.6"
            className="opacity-[0.04] dark:opacity-[0.06]"
          />
          <circle
            cx="450"
            cy="450"
            r="400"
            stroke="#E85D04"
            strokeWidth="0.5"
            className="opacity-[0.025] dark:opacity-[0.035]"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="flex min-h-screen flex-col items-center justify-center px-5 py-12">
        {children}
      </div>
    </>
  );
}
