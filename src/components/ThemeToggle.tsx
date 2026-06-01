import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2.5 rounded-lg bg-secondary text-foreground hover:bg-muted border border-border transition-all flex items-center justify-center hover:scale-105 active:scale-95"
      title={theme === "light" ? "Dunkelmodus aktivieren" : "Hellmodus aktivieren"}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
      ) : (
        <Sun className="w-4 h-4 text-slate-700 dark:text-slate-200" />
      )}
    </button>
  );
}
