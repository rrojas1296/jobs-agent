import type { ResumeContent } from "./resume";
export abstract class ResumeRepository {
  abstract list(userId: string): Promise<unknown>;
  abstract get(userId: string, id: string): Promise<unknown>;
  abstract create(
    userId: string,
    file: { name: string; type: string; data: Buffer },
    content: ResumeContent,
  ): Promise<string>;
  abstract revise(userId: string, id: string, content: ResumeContent): Promise<string>;
  abstract rename(userId: string, id: string, name: string): Promise<void>;
  abstract remove(userId: string, id: string): Promise<void>;
  abstract startCompilation(
    userId: string,
    id: string,
    revisionId: string,
  ): Promise<{ latex: string } | null>;
  abstract finishCompilation(
    revisionId: string,
    pdf: Buffer | null,
    error: string | null,
  ): Promise<void>;
  abstract recoverCompilations(): Promise<void>;
  abstract download(
    userId: string,
    id: string,
    kind: "original" | "tex" | "pdf",
    revisionId?: string,
  ): Promise<{ data: Buffer; type: string; name: string }>;
}
