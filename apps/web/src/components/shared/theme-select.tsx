"use client";
import { Monitor, Moon, Sun } from "lucide-react";
import { useUiStore } from "@/stores/ui.store";
export function ThemeSelect() {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  return (
    <fieldset
      className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-card p-1"
      aria-label="Tema visual"
    >
      {(
        [
          { value: "light", label: "Claro", icon: Sun },
          { value: "dark", label: "Oscuro", icon: Moon },
          { value: "system", label: "Sistema", icon: Monitor },
        ] as const
      ).map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          title={label}
          aria-label={`Tema ${label}`}
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          className={`rounded-md p-1.5 transition-colors ${theme === value ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Icon size={15} />
        </button>
      ))}
    </fieldset>
  );
}
