import { BadRequestException, ConflictException, Injectable, OnModuleInit } from "@nestjs/common";
import { ResumeRepository } from "../domain/resume.repository";
import { importedContent } from "../domain/resume";
import { DocumentProcessor } from "../infrastructure/document-processor";
@Injectable()
export class ResumesService implements OnModuleInit {
  constructor(
    private readonly repository: ResumeRepository,
    private readonly processor: DocumentProcessor,
  ) {}
  async onModuleInit() {
    await this.repository.recoverCompilations();
  }
  async import(userId: string, file?: { originalname: string; buffer: Buffer }) {
    if (!file?.buffer.length || file.buffer.length > 5 * 1024 * 1024)
      throw new BadRequestException("Selecciona un PDF o DOCX de hasta 5 MB.");
    const extension = file.originalname.toLowerCase().split(".").pop();
    const pdf = extension === "pdf" && file.buffer.subarray(0, 5).toString() === "%PDF-";
    const docx =
      extension === "docx" &&
      file.buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
    if (!pdf && !docx)
      throw new BadRequestException("Solo se admiten archivos PDF y DOCX válidos.");
    const text = await this.processor.extract(file.buffer, pdf ? "pdf" : "docx");
    const name = Array.from(file.originalname)
      .map((char) =>
        char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127 || char === "/" || char === "\\"
          ? "_"
          : char,
      )
      .join("")
      .slice(0, 180);
    const id = await this.repository.create(
      userId,
      {
        name,
        type: pdf
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        data: file.buffer,
      },
      importedContent(text),
    );
    return this.repository.get(userId, id);
  }
  async compile(userId: string, id: string, revisionId: string) {
    const revision = await this.repository.startCompilation(userId, id, revisionId);
    if (!revision)
      throw new ConflictException("La revisión ya está lista, se está compilando o no existe.");
    try {
      const pdf = await this.processor.compile(revision.latex);
      await this.repository.finishCompilation(revisionId, pdf, null);
    } catch {
      await this.repository.finishCompilation(
        revisionId,
        null,
        "No se pudo generar el PDF. Reintenta la compilación; si continúa fallando, revisa el contenido o contacta con soporte.",
      );
    }
    return this.repository.get(userId, id);
  }
}
