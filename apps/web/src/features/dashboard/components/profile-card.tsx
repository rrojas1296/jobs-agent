import { Check, CheckCheck, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { User } from "@/features/auth/types/user";
export function ProfileCard({ user }: { user: User }) {
  return (
    <section className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">Tu perfil profesional</h2>
        <CheckCheck size={17} className="text-muted-foreground" />
      </div>
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-linear-to-br from-[#7155fb] via-[#6046e8] to-[#4023c7] p-5 text-white">
        <div
          aria-hidden
          className="absolute -top-16 -right-12 size-44 rounded-full border-[24px] border-white/5"
        />
        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[10px]">
          <span className="size-1.5 rounded-full bg-emerald-300" />
          Perfil activo
        </span>
        <div className="mt-6 flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/15 text-sm">
          {user.firstName[0]}
          {user.lastName[0]}
        </div>
        <p className="mt-3 text-lg font-medium">
          {user.firstName} {user.lastName}
        </p>
        <p className="mt-1 text-xs text-white/70">Listo para nuevas oportunidades</p>
        <div className="mt-5 flex items-center justify-between border-t border-white/20 pt-3 text-[10px] text-white/75">
          <span>NEXO · MI CARRERA</span>
          <Check size={14} />
        </div>
      </div>
      <div className="mt-5 flex justify-between text-xs">
        <span className="text-muted-foreground">Onboarding completado</span>
        <span className="font-medium">100%</span>
      </div>
      <div className="mt-2 h-1 rounded-full bg-muted">
        <div className="h-full w-full rounded-full bg-primary" />
      </div>
      <Link
        href="/settings"
        className="mt-5 flex items-center justify-between text-xs text-muted-foreground hover:text-primary"
      >
        Ver mi información
        <ArrowUpRight size={14} />
      </Link>
    </section>
  );
}
