import Link from "next/link";
import { Layers2 } from "lucide-react";
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Nexo, inicio">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#6046e8] text-white shadow-[inset_0_1px_3px_#ffffff66]">
        <Layers2 size={21} strokeWidth={1.7} />
      </span>
      {!compact && (
        <span className="text-[23px] font-semibold tracking-[-1px]">
          nexo<span className="text-primary">.</span>
        </span>
      )}
    </Link>
  );
}
