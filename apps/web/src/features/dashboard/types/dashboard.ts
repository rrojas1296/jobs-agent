export interface DashboardData {
  statistics: { found: number; compatible: number; applications: number; resumes: number };
  activity: { id: string; title: string; date: string }[];
}
export interface DemoJob {
  id: string;
  title: string;
  company: string;
  monogram: string;
  color: string;
  location: string;
  modality: string;
  technologies: string[];
  compatibility: number;
  salary: string;
}
