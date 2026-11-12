import { api } from "@/lib/api/client";
import type { ResumeContent, ResumeDetail, ResumeSummary } from "../types/resume";
export const resumesService = {
  list: async () => (await api.get<ResumeSummary[]>("/resumes")).data,
  get: async (id: string) => (await api.get<ResumeDetail>(`/resumes/${id}`)).data,
  import: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return (await api.post<ResumeDetail>("/resumes/import", form, { timeout: 60000 })).data;
  },
  revise: async (id: string, content: ResumeContent) =>
    (await api.post<ResumeDetail>(`/resumes/${id}/revisions`, content)).data,
  compile: async (id: string, revision: string) =>
    (
      await api.post<ResumeDetail>(
        `/resumes/${id}/revisions/${revision}/compile`,
        {},
        { timeout: 60000 },
      )
    ).data,
  rename: async (id: string, name: string) =>
    (await api.patch<ResumeDetail>(`/resumes/${id}`, { name })).data,
  remove: async (id: string) => {
    await api.delete(`/resumes/${id}`);
  },
  file: async (id: string, kind: "original" | "tex" | "pdf", revision?: string) =>
    (
      await api.get<Blob>(`/resumes/${id}/download/${kind}`, {
        params: { revision },
        responseType: "blob",
      })
    ).data,
};
