"use client";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

function ThemeChanger() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Mobile Theme Button (shows below 640px) */}
      <div className="fixed bottom-20 right-4 sm:hidden">
        <button
          onClick={toggleTheme}
          className="rounded-full p-3 backdrop-blur-md bg-white/30 dark:bg-black/30 shadow-lg hover:bg-white/40 dark:hover:bg-black/40 transition-all"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-slate-700" />
          )}
        </button>
      </div>

      {/* Desktop Theme Switch (shows above 640px) */}
      <div className="fixed bottom-6 right-4 hidden sm:flex items-center space-x-2">
        <div className="rounded-full p-2 backdrop-blur-md bg-white/30 dark:bg-black/30 shadow-lg flex items-center space-x-2">
          <Sun className="h-4 w-4 text-yellow-500" />
          <Switch
            id="theme-toggle"
            checked={theme === "dark"}
            onCheckedChange={toggleTheme}
          />
          <Moon className="h-4 w-4 text-slate-700" />
          <Label htmlFor="theme-toggle" className="sr-only">
            Toggle theme
          </Label>
        </div>
      </div>
    </>
  );
}

export default ThemeChanger;