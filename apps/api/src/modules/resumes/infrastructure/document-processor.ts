import { BadRequestException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, writeFile, chmod, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
const execute = promisify(execFile);
@Injectable()
export class DocumentProcessor {
  private active = 0;
  private async run(data: Buffer, filename: string, command: string[]): Promise<Buffer> {
    if (this.active >= 2)
      throw new ServiceUnavailableException(
        "Estamos procesando otros documentos. Inténtalo en un momento.",
      );
    this.active++;
    let directory: string | undefined;
    const name = `nexo-cv-${randomUUID()}`;
    try {
      directory = await mkdtemp(join(tmpdir(), "nexo-cv-"));
      await chmod(directory, 0o755);
      await writeFile(join(directory, filename), data, { mode: 0o644 });
      const result = await execute(
        "docker",
        [
          "run",
          "--rm",
          "--name",
          name,
          "--network=none",
          "--read-only",
          "--cap-drop=ALL",
          "--security-opt=no-new-privileges",
          "--memory=384m",
          "--cpus=1",
          "--pids-limit=64",
          "--ulimit",
          "fsize=16777216:16777216",
          "--user=65534:65534",
          "--mount",
          `type=bind,src=${directory},dst=/input,readonly`,
          "--tmpfs",
          "/tmp:rw,noexec,nosuid,size=32m,mode=1777",
          "--tmpfs",
          "/work:rw,noexec,nosuid,size=64m,mode=1777",
          "nexo-resumes:1",
          ...command,
        ],
        { timeout: 45000, maxBuffer: 4 * 1024 * 1024, encoding: "buffer" },
      );
      return result.stdout;
    } finally {
      await execute("docker", ["rm", "-f", name], { timeout: 5000 }).catch(() => undefined);
      if (directory) await rm(directory, { recursive: true, force: true });
      this.active--;
    }
  }
  async extract(data: Buffer, extension: "pdf" | "docx") {
    let output: Buffer;
    try {
      output = await this.run(
        data,
        `original.${extension}`,
        extension === "pdf"
          ? ["pdftotext", "-enc", "UTF-8", "-nopgbrk", "/input/original.pdf", "-"]
          : ["python3", "/opt/extract-docx.py", "/input/original.docx"],
      );
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new BadRequestException(
        "No pudimos leer el documento. Comprueba que sea un PDF con texto o un DOCX válido, sin contraseña, y vuelve a intentarlo.",
      );
    }
    const text = output.toString("utf8").replaceAll(String.fromCharCode(0), "").trim();
    if (text.length < 20)
      throw new BadRequestException(
        "No encontramos suficiente texto. Si tu CV está escaneado, exporta una versión con texto o usa DOCX.",
      );
    if (text.length > 60000)
      throw new BadRequestException("El CV tiene demasiado texto (máximo 60 000 caracteres).");
    return text;
  }
  async compile(latex: string) {
    const output = await this.run(Buffer.from(latex), "document.tex", [
      "sh",
      "-c",
      "pdflatex -no-shell-escape -interaction=nonstopmode -halt-on-error -output-directory=/work /input/document.tex >/dev/null 2>&1 && cat /work/document.pdf",
    ]);
    if (output.subarray(0, 5).toString() !== "%PDF-") throw new Error("Invalid compiler output");
    return output;
  }
}
