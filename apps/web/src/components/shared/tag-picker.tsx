"use client";
import { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export function TagPicker({
  id,
  value,
  onChange,
  suggestions = [],
  placeholder = "Escribe y pulsa Enter",
}: {
  id: string;
  value: string[];
  onChange: (value: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}) {
  const [search, setSearch] = useState("");
  function add(item: string) {
    const text = item.trim().slice(0, 80);
    if (text && !value.some((v) => v.toLowerCase() === text.toLowerCase()) && value.length < 30)
      onChange([...value, text]);
    setSearch("");
  }
  return (
    <div>
      <div className="flex gap-2">
        <Input
          id={id}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          maxLength={80}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(search);
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          aria-label="Añadir opción"
          onClick={() => add(search)}
          disabled={!search.trim() || value.length >= 30}
        >
          <Plus size={17} />
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2" aria-live="polite">
        {value.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-2 rounded-md border border-primary/15 bg-primary/7 py-1.5 pr-1.5 pl-2.5 text-xs text-primary"
          >
            {item}
            <button
              type="button"
              aria-label={`Quitar ${item}`}
              onClick={() => onChange(value.filter((v) => v !== item))}
              className="rounded p-1 hover:bg-primary/10"
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>
      {suggestions.length > 0 && (
        <>
          <p className="mt-5 mb-2 text-xs text-muted-foreground">
            {search
              ? "Resultados · también puedes añadir una nueva"
              : "Populares · selecciona las que conoces"}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions
              .filter((s) => s.toLowerCase().includes(search.toLowerCase()))
              .map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={value.includes(item)}
                  onClick={() =>
                    value.includes(item) ? onChange(value.filter((v) => v !== item)) : add(item)
                  }
                  className="tag hover:border-primary/50"
                >
                  {value.includes(item) ? (
                    <Check size={12} className="text-primary" />
                  ) : (
                    <Plus size={12} />
                  )}
                  {item}
                </button>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
