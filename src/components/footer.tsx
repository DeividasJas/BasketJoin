export default function Footer() {
  return (
    <footer className="mt-auto hidden h-10 items-center justify-center text-[11px] text-zinc-400 dark:text-zinc-600 sm:order-last sm:flex md:h-14">
      <p>&copy; {new Date().getFullYear()} BasketJoin</p>
    </footer>
  );
}
