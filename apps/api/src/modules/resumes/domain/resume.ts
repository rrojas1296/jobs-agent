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
export const TEMPLATE_VERSION = "nexo-classic-v1";
export function escapeLatex(value: string): string {
  const escapes: Record<string, string> = {
    "\\": "\\textbackslash{}",
    "{": "\\{",
    "}": "\\}",
    $: "\\$",
    "&": "\\&",
    "#": "\\#",
    "%": "\\%",
    _: "\\_",
    "~": "\\textasciitilde{}",
    "^": "\\textasciicircum{}",
  };
  const printable = Array.from(value)
    .filter((char) => char.charCodeAt(0) >= 32 || char === "\n" || char === "\r" || char === "\t")
    .join("");
  return printable
    .replace(/[\\{}$&#%_~^]/g, (char) => escapes[char]!)
    .replaceAll(String.fromCharCode(0), "")
    .replace(/[\u2010-\u2014]/g, "-");
}
export function renderLatex(content: ResumeContent): string {
  const lines = (text: string) => text.split(/\r?\n/).map(escapeLatex).join("\\newline\n");
  const sections: [string, string][] = [
    ["Perfil profesional", content.summary],
    ["Experiencia", content.experience],
    ["Formación", content.education],
    ["Habilidades", content.skills],
    ["Información adicional", content.additional],
  ];
  return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[margin=2cm]{geometry}
\\usepackage{hyperref}
\\hypersetup{hidelinks}
\\usepackage{microtype}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{6pt}
\\emergencystretch=3em
\\begin{document}
{\\LARGE\\bfseries ${escapeLatex(content.fullName)}}\\par
${lines(content.headline)}\\par
{\\small ${lines(content.contact)}}\\par
${sections
  .filter(([, text]) => text.trim())
  .map(([title, text]) => `\\section*{${title}}\n${lines(text)}\n`)
  .join("\n")}
\\end{document}
`;
}
// Without AI, preserve every extracted line for review rather than guessing employment history.
export function importedContent(text: string): ResumeContent {
  return {
    fullName: "",
    headline: "",
    contact: "",
    summary: "",
    experience: "",
    education: "",
    skills: "",
    additional: text.trim(),
  };
}
