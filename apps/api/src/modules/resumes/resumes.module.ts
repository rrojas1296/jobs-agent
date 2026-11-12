import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ResumeRepository } from "./domain/resume.repository";
import { DrizzleResumeRepository } from "./infrastructure/drizzle-resume.repository";
import { DocumentProcessor } from "./infrastructure/document-processor";
import { ResumesService } from "./application/resumes.service";
import { ResumesController } from "./presentation/resumes.controller";
@Module({
  imports: [AuthModule],
  controllers: [ResumesController],
  providers: [
    ResumesService,
    DocumentProcessor,
    { provide: ResumeRepository, useClass: DrizzleResumeRepository },
  ],
})
export class ResumesModule {}
