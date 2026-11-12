"use client";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Upload, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/client";
import { resumesService } from "../services/resumes.service";
import { ResumeEditor } from "./resume-editor";
export function ResumesContent() {
  const client = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const list = useQuery({ queryKey: ["resumes"], queryFn: resumesService.list });
  const detail = useQuery({
    queryKey: ["resumes", selected],
    queryFn: () => resumesService.get(selected!),
    enabled: !!selected,
    refetchInterval: (query) =>
      query.state.data?.revisions.some((r) => r.status === "compiling") ? 2000 : false,
  });
  const upload = useMutation({
    mutationFn: resumesService.import,
    onSuccess: (data) => {
      client.setQueryData(["resumes", data.id], data);
      setDirty(false);
      setSelected(data.id);
      void client.invalidateQueries({ queryKey: ["dashboard"] });
      void client.invalidateQueries({ queryKey: ["resumes"], exact: true });
      toast.success("CV importado. Revisa el contenido antes de generar el PDF.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  return (
    <div className="space-y-6">
      <section className="panel flex flex-wrap items-center justify-between gap-5 p-6">
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold">Tu trayectoria, en un solo lugar</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Importa tu CV, revisa el contenido y descarga una versión con un diseño profesional.
            Conservaremos también tu archivo original.
          </p>
          <p id="upload-help" className="mt-2 text-xs text-muted-foreground">
            PDF con texto o DOCX · Hasta 5 MB. Los documentos escaneados todavía no son compatibles.
          </p>
        </div>
        <div>
          <input
            ref={input}
            type="file"
            accept=".pdf,.docx"
            className="sr-only"
            aria-label="Seleccionar CV"
            aria-describedby="upload-help"
            disabled={upload.isPending}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              if (file.size > 5 * 1024 * 1024 || !/\.(pdf|docx)$/i.test(file.name)) {
                toast.error("Selecciona un PDF o DOCX de hasta 5 MB.");
                return;
              }
              if (
                dirty &&
                !window.confirm(
                  "Tienes cambios sin guardar. ¿Quieres descartarlos e importar otro CV?",
                )
              )
                return;
              upload.mutate(file);
            }}
          />
          <Button disabled={upload.isPending} onClick={() => input.current?.click()}>
            {upload.isPending ? <LoaderCircle className="animate-spin" /> : <Upload />}{" "}
            {upload.isPending ? "Extrayendo contenido…" : "Importar CV"}
          </Button>
          <output className="mt-2 text-xs text-muted-foreground">
            {upload.isPending ? "Puede tardar unos segundos." : ""}
          </output>
        </div>
      </section>
      <div className="grid items-start gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="panel p-4" aria-label="Tus currículums">
          <h2 className="mb-3 font-semibold">Mis CV</h2>
          {list.isPending ? (
            <output className="text-sm">Cargando CV…</output>
          ) : list.isError ? (
            <div role="alert">
              <p className="text-sm">{errorMessage(list.error)}</p>
              <Button variant="outline" onClick={() => void list.refetch()}>
                Reintentar
              </Button>
            </div>
          ) : list.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no tienes CV. Importa el primero para empezar.
            </p>
          ) : (
            <ul className="space-y-2">
              {list.data.map((resume) => (
                <li key={resume.id}>
                  <button
                    type="button"
                    aria-pressed={selected === resume.id}
                    onClick={() => {
                      if (
                        selected === resume.id ||
                        !dirty ||
                        window.confirm("Tienes cambios sin guardar. ¿Quieres descartarlos?")
                      ) {
                        setDirty(false);
                        setSelected(resume.id);
                      }
                    }}
                    className={`w-full rounded-lg border p-3 text-left focus-visible:outline-2 focus-visible:outline-primary ${selected === resume.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}
                  >
                    <FileText className="mb-2 size-4 text-primary" />
                    <span className="block break-words text-sm font-medium">{resume.name}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {new Date(resume.updatedAt).toLocaleDateString("es")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
        <div className="min-w-0">
          {!selected ? (
            <section className="panel p-8 text-center">
              <FileText className="mx-auto mb-4 size-8 text-primary" />
              <h2 className="font-semibold">Un CV que puedes seguir mejorando</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Selecciona un documento para editarlo. Cada cambio guardado conservará una nueva
                versión.
              </p>
            </section>
          ) : detail.isPending ? (
            <output>Cargando documento…</output>
          ) : detail.isError ? (
            <section className="panel p-6" role="alert">
              <p>{errorMessage(detail.error)}</p>
              <Button variant="outline" onClick={() => void detail.refetch()}>
                Reintentar
              </Button>
            </section>
          ) : (
            <ResumeEditor
              key={detail.data.id}
              resume={detail.data}
              onDirtyChange={setDirty}
              onDeleted={() => setSelected(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
