import { X } from "lucide-react";
import { desiredRoles } from "../data/profile-options";

export function RoleSelect({
  id,
  value,
  onChange,
  onBlur,
  invalid,
}: {
  id: string;
  value: string[];
  onChange: (value: string[]) => void;
  onBlur: () => void;
  invalid: boolean;
}) {
  return (
    <div>
      <select
        id={id}
        value=""
        onBlur={onBlur}
        aria-invalid={invalid}
        disabled={value.length >= 30}
        onChange={(event) => {
          const role = event.target.value;
          if (role && !value.includes(role) && value.length < 30) {
            onChange([...value, role]);
          }
        }}
        className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm focus-visible:outline-primary disabled:opacity-50 aria-invalid:border-destructive"
      >
        <option value="" disabled>
          Selecciona un rol
        </option>
        {desiredRoles.map((role) => (
          <option key={role} value={role} disabled={value.includes(role)}>
            {role}
          </option>
        ))}
      </select>
      <div className="mt-3 flex flex-wrap gap-2" aria-live="polite">
        {value.map((role) => (
          <span
            key={role}
            className="inline-flex items-center gap-2 rounded-md border border-primary/15 bg-primary/7 py-1.5 pr-1.5 pl-2.5 text-xs text-primary"
          >
            {role}
            <button
              type="button"
              aria-label={`Quitar ${role}`}
              onClick={() => onChange(value.filter((item) => item !== role))}
              className="rounded p-1 hover:bg-primary/10 focus-visible:outline-primary"
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
