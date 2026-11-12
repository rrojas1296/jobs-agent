export interface ResumeContent {
  fullName: string;
  headline: string;
  contact: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  additional: string;
}
export interface ResumeSummary {
  id: string;
  name: string;
  originalName: string;
  createdAt: string;
  updatedAt: string;
}
export interface ResumeRevision {
  id: string;
  number: number;
  content: ResumeContent;
  status: "review" | "compiling" | "ready" | "error";
  error: string | null;
  createdAt: string;
  templateVersion: string;
}
export interface ResumeDetail extends ResumeSummary {
  revisions: ResumeRevision[];
}
