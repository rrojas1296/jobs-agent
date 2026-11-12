import "reflect-metadata";
import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeLatex, importedContent, renderLatex } from "../modules/resumes/domain/resume";
import { contentSchema } from "../modules/resumes/presentation/resumes.controller";
test("CV import preserves content without guessing fields", () => {
  const text = "María Pérez\nExperiencia\nDesarrolladora en Nexo, 2020-2025";
  const content = importedContent(text);
  assert.equal(content.additional, text);
  assert.equal(content.experience, "");
  assert.equal(content.fullName, "");
});
test("LaTeX treats commands and special characters as literal user text", () => {
  assert.equal(
    escapeLatex("100% & C_# ${} ~ ^ \\"),
    "100\\% \\& C\\_\\# \\$\\{\\} \\textasciitilde{} \\textasciicircum{} \\textbackslash{}",
  );
  const latex = renderLatex({
    ...importedContent(""),
    fullName: "Ana",
    experience: "\\input{/etc/passwd}\nA&B",
  });
  assert.ok(!latex.includes("\\input{"));
  assert.ok(latex.includes("\\textbackslash{}input\\{/etc/passwd\\}"));
  assert.ok(latex.includes("A\\&B"));
});
test("CV validation bounds total size and requires a reviewed name", () => {
  assert.equal(contentSchema.safeParse(importedContent("Text")).success, false);
  assert.equal(
    contentSchema.safeParse({ ...importedContent("Text"), fullName: "Ana" }).success,
    true,
  );
  assert.equal(
    contentSchema.safeParse({ ...importedContent("a".repeat(60000)), fullName: "Ana" }).success,
    false,
  );
});
