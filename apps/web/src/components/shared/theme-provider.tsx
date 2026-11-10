"use client";
import { useEffect } from "react";
import { useUiStore, type Theme } from "@/stores/ui.store";
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("jobs-theme");
    } catch {
      /* Use system preference. */
    }
    const theme: Theme = saved === "light" || saved === "dark" ? saved : "system";
    useUiStore.setState({ theme });
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const choice = useUiStore.getState().theme;
      const dark = choice === "dark" || (choice === "system" && media.matches);
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    };
    apply();
    const unsubscribe = useUiStore.subscribe(apply);
    media.addEventListener("change", apply);
    return () => {
      unsubscribe();
      media.removeEventListener("change", apply);
    };
  }, []);
  return children;
}
