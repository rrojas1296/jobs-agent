import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { and, desc, eq, getTableColumns } from "drizzle-orm";
import { DrizzleService } from "../../../database/drizzle/drizzle.service";
import { resumes, resumeRevisions } from "../../../database/drizzle/schemas/resumes";
import { ResumeRepository } from "../domain/resume.repository";
import { renderLatex, TEMPLATE_VERSION, type ResumeContent } from "../domain/resume";
const { original: _original, ...resumeMetadata } = getTableColumns(resumes);
const { pdf: _pdf, latex: _latex, ...revisionMetadata } = getTableColumns(resumeRevisions);
@Injectable()
export class DrizzleResumeRepository extends ResumeRepository {
  constructor(private readonly database: DrizzleService) {
    super();
  }
  private async owned(userId: string, id: string) {
    const [row] = await this.database.db
      .select(resumeMetadata)
      .from(resumes)
      .where(and(eq(resumes.id, id), eq(resumes.userId, userId)));
    if (!row) throw new NotFoundException("CV no encontrado");
    return row;
  }
  async list(userId: string) {
    return this.database.db
      .select(resumeMetadata)
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumes.updatedAt));
  }
  async get(userId: string, id: string) {
    const resume = await this.owned(userId, id);
    const revisions = await this.database.db
      .select(revisionMetadata)
      .from(resumeRevisions)
      .where(eq(resumeRevisions.resumeId, id))
      .orderBy(desc(resumeRevisions.number));
    return { ...resume, revisions };
  }
  async create(
    userId: string,
    file: { name: string; type: string; data: Buffer },
    content: ResumeContent,
  ) {
    return this.database.db.transaction(async (tx) => {
      const [row] = await tx
        .insert(resumes)
        .values({
          userId,
          name: file.name.replace(/\.[^.]+$/, ""),
          originalName: file.name,
          originalType: file.type,
          original: file.data,
        })
        .returning({ id: resumes.id });
      await tx.insert(resumeRevisions).values({
        resumeId: row!.id,
        number: 1,
        content,
        latex: renderLatex(content),
        templateVersion: TEMPLATE_VERSION,
        status: "review",
      });
      return row!.id;
    });
  }
  async revise(userId: string, id: string, content: ResumeContent) {
    await this.owned(userId, id);
    return this.database.db.transaction(async (tx) => {
      // Serialize revisions and deletion on the parent row.
      const [parent] = await tx
        .select({ id: resumes.id })
        .from(resumes)
        .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
        .for("update");
      if (!parent) throw new NotFoundException("CV no encontrado");
      const [last] = await tx
        .select({ number: resumeRevisions.number, status: resumeRevisions.status })
        .from(resumeRevisions)
        .where(eq(resumeRevisions.resumeId, id))
        .orderBy(desc(resumeRevisions.number))
        .limit(1);
      if (last?.status === "compiling")
        throw new ConflictException("Espera a que termine la compilación");
      const [row] = await tx
        .insert(resumeRevisions)
        .values({
          resumeId: id,
          number: (last?.number ?? 0) + 1,
          content,
          latex: renderLatex(content),
          templateVersion: TEMPLATE_VERSION,
          status: "review",
        })
        .returning({ id: resumeRevisions.id });
      await tx.update(resumes).set({ updatedAt: new Date() }).where(eq(resumes.id, id));
      return row!.id;
    });
  }
  async rename(userId: string, id: string, name: string) {
    await this.owned(userId, id);
    await this.database.db
      .update(resumes)
      .set({ name, updatedAt: new Date() })
      .where(and(eq(resumes.id, id), eq(resumes.userId, userId)));
  }
  async remove(userId: string, id: string) {
    await this.owned(userId, id);
    await this.database.db
      .delete(resumes)
      .where(and(eq(resumes.id, id), eq(resumes.userId, userId)));
  }
  async startCompilation(userId: string, id: string, revisionId: string) {
    await this.owned(userId, id);
    const [row] = await this.database.db
      .update(resumeRevisions)
      .set({ status: "compiling", error: null })
      .where(
        and(
          eq(resumeRevisions.id, revisionId),
          eq(resumeRevisions.resumeId, id),
          eq(resumeRevisions.status, "review"),
        ),
      )
      .returning({ latex: resumeRevisions.latex });
    if (row) return row;
    const [retry] = await this.database.db
      .update(resumeRevisions)
      .set({ status: "compiling", error: null })
      .where(
        and(
          eq(resumeRevisions.id, revisionId),
          eq(resumeRevisions.resumeId, id),
          eq(resumeRevisions.status, "error"),
        ),
      )
      .returning({ latex: resumeRevisions.latex });
    return retry ?? null;
  }
  async finishCompilation(revisionId: string, pdf: Buffer | null, error: string | null) {
    await this.database.db
      .update(resumeRevisions)
      .set({ pdf, error, status: pdf ? "ready" : "error" })
      .where(eq(resumeRevisions.id, revisionId));
  }
  async recoverCompilations() {
    await this.database.db
      .update(resumeRevisions)
      .set({ status: "error", error: "La compilación se interrumpió. Vuelve a intentarlo." })
      .where(eq(resumeRevisions.status, "compiling"));
  }
  async download(
    userId: string,
    id: string,
    kind: "original" | "tex" | "pdf",
    revisionId?: string,
  ) {
    const resume = await this.owned(userId, id);
    if (kind === "original") {
      const [row] = await this.database.db
        .select({ data: resumes.original })
        .from(resumes)
        .where(and(eq(resumes.id, id), eq(resumes.userId, userId)));
      if (!row) throw new NotFoundException("CV no encontrado");
      return { data: row.data, type: resume.originalType, name: resume.originalName };
    }
    const [revision] = await this.database.db
      .select()
      .from(resumeRevisions)
      .where(
        and(
          eq(resumeRevisions.resumeId, id),
          revisionId ? eq(resumeRevisions.id, revisionId) : undefined,
        ),
      )
      .orderBy(desc(resumeRevisions.number))
      .limit(1);
    if (!revision || (kind === "pdf" && !revision.pdf))
      throw new NotFoundException("Documento todavía no disponible");
    return {
      data: kind === "tex" ? Buffer.from(revision.latex) : revision.pdf!,
      type: kind === "tex" ? "application/x-tex" : "application/pdf",
      name: `cv-v${revision.number}.${kind}`,
    };
  }
}
