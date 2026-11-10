export default function Loading() {
  return (
    <div aria-live="polite" aria-busy="true" className="mx-auto w-full max-w-5xl space-y-4 p-6">
      <span className="sr-only">Cargando…</span>
      <div className="h-20 animate-pulse rounded-xl bg-card" />
      <div className="h-72 animate-pulse rounded-xl bg-card" />
    </div>
  );
}
