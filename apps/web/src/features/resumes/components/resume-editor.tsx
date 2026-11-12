"use client";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Download, LoaderCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errorMessage } from "@/lib/api/client";
import { resumesService } from "../services/resumes.service";
import type { ResumeContent, ResumeDetail, ResumeRevision } from "../types/resume";
const statusLabel = {
  review: "Pendiente de revisión",
  compiling: "Generando PDF…",
  ready: "PDF listo",
  error: "Requiere atención",
};
const fields: {
  key: keyof ResumeContent;
  label: string;
  hint?: string;
  rows: number;
  max: number;
}[] = [
  { key: "fullName", label: "Nombre completo", rows: 1, max: 160 },
  { key: "headline", label: "Título profesional", rows: 1, max: 240 },
  {
    key: "contact",
    label: "Contacto y enlaces",
    hint: "Correo, teléfono, ubicación y enlaces profesionales.",
    rows: 3,
    max: 1500,
  },
  { key: "summary", label: "Perfil profesional", rows: 4, max: 15000 },
  {
    key: "experience",
    label: "Experiencia",
    hint: "Incluye puestos, empresas, fechas y logros.",
    rows: 7,
    max: 15000,
  },
  { key: "education", label: "Formación", rows: 4, max: 15000 },
  { key: "skills", label: "Habilidades e idiomas", rows: 4, max: 15000 },
  {
    key: "additional",
    label: "Información adicional",
    hint: "El texto importado aparece aquí. Distribúyelo entre las secciones y conserva aquí lo que quieras incluir al final.",
    rows: 12,
    max: 60000,
  },
];
export function ResumeEditor({
  resume,
  onDeleted,
  onDirtyChange,
}: {
  resume: ResumeDetail;
  onDeleted: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const client = useQueryClient();
  const latest = resume.revisions[0]!;
  const [revisionId, setRevisionId] = useState(latest.id);
  const revision = resume.revisions.find((item) => item.id === revisionId) ?? latest;
  const [content, setContent] = useState<ResumeContent>(revision.content);
  const [name, setName] = useState(resume.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewRevision, setPreviewRevision] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const dirty = JSON.stringify(content) !== JSON.stringify(revision.content);
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    if (!dirty) return;
    const preventExit = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", preventExit);
    return () => window.removeEventListener("beforeunload", preventExit);
  }, [dirty]);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  const update = (data: ResumeDetail) => {
    client.setQueryData(["resumes", resume.id], data);
    void client.invalidateQueries({ queryKey: ["resumes"], exact: true });
  };
  const compile = useMutation({
    mutationFn: (id: string) => resumesService.compile(resume.id, id),
    onSuccess: (data) => {
      update(data);
      if (data.revisions.find((r) => r.id === revisionId)?.status === "ready")
        toast.success("PDF generado");
    },
    onError: (error) => toast.error(errorMessage(error)),
    onSettled: () => {
      void client.invalidateQueries({ queryKey: ["resumes", resume.id] });
    },
  });
  const save = useMutation({
    mutationFn: () => resumesService.revise(resume.id, content),
    onSuccess: (data) => {
      update(data);
      const next = data.revisions[0]!;
      setRevisionId(next.id);
      setContent(next.content);
      toast.success("Nueva versión guardada");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const rename = useMutation({
    mutationFn: () => resumesService.rename(resume.id, name),
    onSuccess: update,
    onError: (error) => toast.error(errorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: () => resumesService.remove(resume.id),
    onSuccess: () => {
      onDeleted();
      void client.invalidateQueries({ queryKey: ["dashboard"] });
      void client.invalidateQueries({ queryKey: ["resumes"] });
      toast.success("CV eliminado");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const busy =
    save.isPending || compile.isPending || latest.status === "compiling" || remove.isPending;
  async function file(kind: "original" | "tex" | "pdf", inline = false) {
    setLoadingFile(true);
    try {
      const blob = await resumesService.file(resume.id, kind, revision.id);
      const url = URL.createObjectURL(blob);
      if (inline) {
        setPreview(url);
        setPreviewRevision(revision.id);
      } else {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download =
          kind === "original" ? resume.originalName : `cv-v${revision.number}.${kind}`;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch {
      toast.error("No se pudo descargar el documento. Inténtalo de nuevo.");
    } finally {
      setLoadingFile(false);
    }
  }
  function selectRevision(next: ResumeRevision) {
    if (dirty && !window.confirm("Tienes cambios sin guardar. ¿Quieres descartarlos?")) return;
    setRevisionId(next.id);
    setContent(next.content);
  }
  return (
    <section className="panel space-y-6 p-5 sm:p-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <label htmlFor="resume-name" className="mb-2 block text-sm font-medium">
            Nombre del CV
          </label>
          <Input
            id="resume-name"
            value={name}
            maxLength={180}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          disabled={rename.isPending || !name.trim() || name === resume.name}
          onClick={() => rename.mutate()}
        >
          Renombrar
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
        <div>
          <label htmlFor="revision" className="mr-2 text-sm">
            Versión
          </label>
          <select
            id="revision"
            value={revision.id}
            disabled={busy}
            onChange={(e) => selectRevision(resume.revisions.find((r) => r.id === e.target.value)!)}
            className="max-w-full rounded-lg border border-border bg-card p-2 text-sm"
          >
            {resume.revisions.map((r) => (
              <option key={r.id} value={r.id}>
                v{r.number} · {new Date(r.createdAt).toLocaleString("es")} · {statusLabel[r.status]}
              </option>
            ))}
          </select>
        </div>
        <output className="text-sm text-muted-foreground">
          {compile.isPending ? "Generando PDF…" : statusLabel[revision.status]}
        </output>
      </div>
      <p className="text-sm text-muted-foreground">
        Revisa el texto y organízalo en las secciones. Usaremos una plantilla propia; el diseño del
        archivo original no se conserva.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
        className="space-y-5"
      >
        <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2">
          {fields.map(({ key, label, hint, rows, max }) => (
            <div key={key} className={rows > 1 ? "sm:col-span-2" : ""}>
              <label htmlFor={`cv-${key}`} className="mb-2 block text-sm font-medium">
                {label}
                {key === "fullName" ? " *" : ""}
              </label>
              <textarea
                id={`cv-${key}`}
                value={content[key]}
                required={key === "fullName"}
                maxLength={max}
                rows={rows}
                aria-describedby={hint ? `hint-${key}` : undefined}
                onChange={(event) =>
                  setContent((previous) => ({ ...previous, [key]: event.target.value }))
                }
                className="w-full resize-y rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-primary"
              />
              {hint ? (
                <p id={`hint-${key}`} className="mt-1 text-xs text-muted-foreground">
                  {hint}
                </p>
              ) : null}
            </div>
          ))}
        </fieldset>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={busy || !dirty || !content.fullName.trim()}>
            {save.isPending ? "Guardando…" : "Guardar nueva versión"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy || dirty || !content.fullName.trim() || revision.status === "ready"}
            onClick={() => compile.mutate(revision.id)}
          >
            {compile.isPending ? <LoaderCircle className="animate-spin" /> : <FileText />}
            {compile.isPending
              ? "Generando PDF…"
              : revision.status === "error"
                ? "Reintentar PDF"
                : "Generar PDF"}
          </Button>
          <output className="text-xs text-muted-foreground">
            {dirty ? "Cambios sin guardar" : "Versión guardada"}
          </output>
        </div>
      </form>
      {revision.error ? (
        <p role="alert" className="rounded-lg border border-destructive/30 p-3 text-sm">
          {revision.error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2 border-t border-border pt-5">
        <Button
          variant="outline"
          disabled={loadingFile || revision.status !== "ready"}
          onClick={() => void file("pdf", true)}
        >
          Vista previa
        </Button>
        <Button
          variant="outline"
          disabled={loadingFile || revision.status !== "ready"}
          onClick={() => void file("pdf")}
        >
          <Download />
          PDF
        </Button>
        <Button variant="outline" disabled={loadingFile} onClick={() => void file("tex")}>
          <Download />
          LaTeX (.tex)
        </Button>
        <Button variant="ghost" disabled={loadingFile} onClick={() => void file("original")}>
          Descargar original
        </Button>
      </div>
      {preview && previewRevision === revision.id ? (
        <div>
          <iframe
            title={`Vista previa del CV, versión ${revision.number}`}
            src={preview}
            className="h-[650px] w-full rounded-lg border border-border bg-white"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Si tu navegador no muestra la vista previa, descarga el PDF.
          </p>
        </div>
      ) : null}
      <div className="border-t border-border pt-4">
        {confirmDelete ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm">Se eliminarán el original y todas las versiones de este CV.</p>
            <Button disabled={busy} onClick={() => remove.mutate()}>
              Eliminar definitivamente
            </Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
          </div>
        ) : (
          <Button variant="ghost" disabled={busy} onClick={() => setConfirmDelete(true)}>
            <Trash2 />
            Eliminar CV
          </Button>
        )}
      </div>
    </section>
  );
}
