import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { z } from "zod";
import { AuthGuard, type AuthRequest } from "../../auth/presentation/auth.guard";
import { ZodPipe } from "../../../common/zod.pipe";
import { ResumeRepository } from "../domain/resume.repository";
import { ResumesService } from "../application/resumes.service";
const text = z
  .string()
  .refine((value) => !value.includes("\u0000"), "El texto contiene un carácter no válido");
const field = text.max(15000);
export const contentSchema = z
  .object({
    fullName: text.trim().min(1).max(160),
    headline: text.max(240),
    contact: text.max(1500),
    summary: field,
    experience: field,
    education: field,
    skills: field,
    additional: text.max(60000),
  })
  .strict()
  .refine(
    (value) => Object.values(value).reduce((sum, text) => sum + text.length, 0) <= 60000,
    "El contenido supera 60 000 caracteres",
  );
@Controller("resumes")
@UseGuards(AuthGuard)
export class ResumesController {
  constructor(
    private readonly repository: ResumeRepository,
    private readonly service: ResumesService,
  ) {}
  @Get() list(@Req() req: AuthRequest) {
    return this.repository.list(req.user.id);
  }
  @Post("import")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0, parts: 1 },
    }),
  )
  import(@Req() req: AuthRequest, @UploadedFile() file?: Express.Multer.File) {
    return this.service.import(req.user.id, file);
  }
  @Get(":id") get(@Req() req: AuthRequest, @Param("id", ParseUUIDPipe) id: string) {
    return this.repository.get(req.user.id, id);
  }
  @Post(":id/revisions") async revise(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodPipe(contentSchema)) content: z.infer<typeof contentSchema>,
  ) {
    await this.repository.revise(req.user.id, id, content);
    return this.repository.get(req.user.id, id);
  }
  @Post(":id/revisions/:revisionId/compile") compile(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("revisionId", ParseUUIDPipe) revisionId: string,
  ) {
    return this.service.compile(req.user.id, id, revisionId);
  }
  @Patch(":id") async rename(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodPipe(z.object({ name: text.trim().min(1).max(180) }).strict())) input: {
      name: string;
    },
  ) {
    await this.repository.rename(req.user.id, id, input.name);
    return this.repository.get(req.user.id, id);
  }
  @Delete(":id") async remove(@Req() req: AuthRequest, @Param("id", ParseUUIDPipe) id: string) {
    await this.repository.remove(req.user.id, id);
    return { success: true };
  }
  @Get(":id/download/:kind") async download(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("kind", new ZodPipe(z.enum(["original", "tex", "pdf"]))) kind:
      | "original"
      | "tex"
      | "pdf",
    @Query("revision", new ZodPipe(z.uuid().optional())) revisionId: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.repository.download(req.user.id, id, kind, revisionId);
    res.setHeader("Content-Type", file.type);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="cv.${kind === "original" ? (file.type === "application/pdf" ? "pdf" : "docx") : kind}"; filename*=UTF-8''${encodeURIComponent(file.name).replace(/['()*]/g, (c) => `%${c.charCodeAt(0).toString(16)}`)}`,
    );
    return new StreamableFile(file.data);
  }
}
