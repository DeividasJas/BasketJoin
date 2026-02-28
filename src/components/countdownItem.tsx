export default function CountdownItem({
  time,
  period,
}: {
  time: number;
  period: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl font-extralight tabular-nums tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
        {String(time).padStart(2, "0")}
      </span>
      <span className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
        {period}
      </span>
    </div>
  );
}
