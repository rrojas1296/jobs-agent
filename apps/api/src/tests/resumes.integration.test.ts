import "reflect-metadata";
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { writeFile } from "node:fs/promises";
import { createApp } from "../bootstrap";
import { DrizzleService } from "../database/drizzle/drizzle.service";
import { users } from "../database/drizzle/schemas/users";
import { resumes, resumeRevisions } from "../database/drizzle/schemas/resumes";
import { DocumentProcessor } from "../modules/resumes/infrastructure/document-processor";
import { docxFixture } from "./resumes.fixture";
import { renderLatex, importedContent } from "../modules/resumes/domain/resume";
import type { ResumeContent } from "../modules/resumes/domain/resume";
interface Detail {
  id: string;
  name: string;
  revisions: {
    id: string;
    number: number;
    status: string;
    error: string | null;
    content: ResumeContent;
  }[];
}
// Requires migrated PostgreSQL and the locally built nexo-resumes:1 Docker image.
test("CV HTTP flow: private originals, DOCX/PDF extraction, revisions, isolated LaTeX, failures and deletion", async () => {
  const app = await createApp();
  await app.listen(0, "127.0.0.1");
  const url = await app.getUrl();
  const userIds: string[] = [];
  const jars: string[] = [];
  const request = (path: string, method = "GET", body?: unknown, who = 0) =>
    fetch(`${url}${path}`, {
      method,
      headers: {
        cookie: jars[who] ?? "",
        origin: "http://localhost:3000",
        "x-requested-with": "jobs-web",
        ...(body instanceof FormData ? {} : { "content-type": "application/json" }),
      },
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
  const upload = (data: Buffer, name: string, who = 0) => {
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(data)]), name);
    return request("/resumes/import", "POST", form, who);
  };
  try {
    assert.equal((await request("/resumes")).status, 401);
    for (let index = 0; index < 2; index++) {
      const response = await request("/auth/register", "POST", {
        email: `cv-${randomUUID()}@example.com`,
        firstName: "CV",
        lastName: "Test",
        password: "SecurePass1!",
        confirmPassword: "SecurePass1!",
      });
      assert.equal(response.status, 201);
      const user = (await response.json()) as { id: string };
      userIds.push(user.id);
      jars.push(
        response.headers
          .getSetCookie()
          .map((c) => c.split(";")[0])
          .join("; "),
      );
    }
    assert.equal((await upload(Buffer.from("not a pdf"), "bad.pdf")).status, 400);
    assert.equal((await upload(Buffer.alloc(5 * 1024 * 1024 + 1), "large.pdf")).status, 413);
    const imported = await upload(docxFixture, "mi-cv.docx");
    assert.equal(imported.status, 201);
    const resume = (await imported.json()) as Detail;
    assert.match(resume.revisions[0]!.content.additional, /María Pérez/);
    assert.equal(resume.revisions[0]!.status, "review");
    const prefix = `/resumes/${resume.id}`;
    for (const [path, method, body] of [
      [prefix, "GET", undefined],
      [`${prefix}/download/original`, "GET", undefined],
      [`${prefix}/download/tex`, "GET", undefined],
      [`${prefix}/revisions`, "POST", { ...resume.revisions[0]!.content, fullName: "Intruder" }],
      [`${prefix}/revisions/${resume.revisions[0]!.id}/compile`, "POST", {}],
      [prefix, "PATCH", { name: "Stolen" }],
      [prefix, "DELETE", undefined],
    ] as const) {
      assert.equal((await request(path, method, body, 1)).status, 404, `${method} ${path}`);
    }
    assert.equal((await request(`${prefix}/download/pdf`)).status, 404);
    assert.equal(
      (await request(`${prefix}/revisions`, "POST", resume.revisions[0]!.content)).status,
      400,
    );
    const content = {
      ...resume.revisions[0]!.content,
      fullName: "María Pérez",
      headline: "Ingeniera de software",
      contact: "maria@example.com · Lima, Perú",
      experience:
        "Nexo | Desarrolladora | 2022-2026\nMejoré el rendimiento un 35% & mantuve C_#.\n\\input{/etc/passwd}",
      education: "Ingeniería de Sistemas\nUniversidad Nacional, 2018-2022",
      skills: "TypeScript, React, PostgreSQL\nEspañol e inglés",
      additional: "",
    };
    const saved = await request(`${prefix}/revisions`, "POST", content);
    assert.equal(saved.status, 201);
    const revised = (await saved.json()) as Detail;
    assert.equal(revised.revisions.length, 2);
    const revisionId = revised.revisions[0]!.id;
    const compiled = await request(`${prefix}/revisions/${revisionId}/compile`, "POST", {});
    assert.equal(compiled.status, 201);
    const result = (await compiled.json()) as Detail;
    assert.equal(result.revisions[0]!.status, "ready", result.revisions[0]!.error ?? "");
    const pdf = Buffer.from(await (await request(`${prefix}/download/pdf`)).arrayBuffer());
    assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
    assert.match(await app.get(DocumentProcessor).extract(pdf, "pdf"), /María Pérez/);
    const pdfImport = await upload(pdf, "importado.pdf");
    assert.equal(pdfImport.status, 201);
    const pdfResume = (await pdfImport.json()) as Detail;
    assert.match(pdfResume.revisions[0]!.content.additional, /TypeScript/);
    const original = Buffer.from(
      await (await request(`${prefix}/download/original`)).arrayBuffer(),
    );
    assert.deepEqual(original, docxFixture);
    const old = await request(`${prefix}/download/tex?revision=${resume.revisions[0]!.id}`);
    assert.match(await old.text(), /María Pérez/);
    const renamed = await request(prefix, "PATCH", { name: "CV principal" });
    assert.equal(((await renamed.json()) as Detail).name, "CV principal");
    // Fault injection establishes persisted error and retry, without relying on broken user input.
    const processor = app.get(DocumentProcessor);
    const compile = processor.compile.bind(processor);
    const third = (await (
      await request(`${prefix}/revisions`, "POST", { ...content, summary: "Nuevo perfil" })
    ).json()) as Detail;
    processor.compile = async () => {
      throw new Error("simulated compiler outage");
    };
    const failed = (await (
      await request(`${prefix}/revisions/${third.revisions[0]!.id}/compile`, "POST", {})
    ).json()) as Detail;
    assert.equal(failed.revisions[0]!.status, "error");
    assert.ok(failed.revisions[0]!.error);
    processor.compile = compile;
    const retried = (await (
      await request(`${prefix}/revisions/${third.revisions[0]!.id}/compile`, "POST", {})
    ).json()) as Detail;
    assert.equal(retried.revisions[0]!.status, "ready");
    const longContent = {
      ...content,
      summary: "Perfil profesional\n\nCon experiencia en aplicaciones.",
      experience: Array.from(
        { length: 180 },
        (_, i) => `Experiencia ${i + 1}: desarrollo de aplicaciones con React.`,
      ).join("\n"),
    };
    const longPdf = await processor.compile(renderLatex(longContent));
    const longText = await processor.extract(longPdf, "pdf");
    assert.match(longText, /Experiencia 180/);
    assert.match(longText, /María Pérez/);
    const shortPdf = await processor.compile(
      renderLatex({ ...importedContent(""), fullName: "Ana" }),
    );
    await assert.rejects(processor.extract(shortPdf, "pdf"), /No encontramos suficiente texto/);
    assert.equal((await upload(Buffer.from("PK\x03\x04not-a-docx"), "corrupt.docx")).status, 400);
    const concurrent = await Promise.all([
      request(`${prefix}/revisions`, "POST", content),
      request(`${prefix}/revisions`, "POST", content),
    ]);
    assert.deepEqual(
      concurrent.map((r) => r.status),
      [201, 201],
    );
    const afterConcurrent = (await (await request(prefix)).json()) as Detail;
    assert.equal(
      new Set(afterConcurrent.revisions.map((r) => r.number)).size,
      afterConcurrent.revisions.length,
    );
    if (process.env.CV_QA_PDF) await writeFile(process.env.CV_QA_PDF, pdf);
    assert.equal((await request(prefix, "DELETE")).status, 200);
    assert.equal((await request(prefix)).status, 404);
    assert.equal(
      (
        await app
          .get(DrizzleService)
          .db.select()
          .from(resumeRevisions)
          .where(eq(resumeRevisions.resumeId, resume.id))
      ).length,
      0,
    );
    assert.equal(
      (await app.get(DrizzleService).db.select().from(resumes).where(eq(resumes.id, pdfResume.id)))
        .length,
      1,
    );
  } finally {
    if (userIds.length)
      await app.get(DrizzleService).db.delete(users).where(inArray(users.id, userIds));
    await app.close();
  }
});
