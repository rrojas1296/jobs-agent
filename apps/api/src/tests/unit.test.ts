import "reflect-metadata";
import { test } from "node:test";
import assert from "node:assert/strict";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";
import { SignJWT } from "jose";
import { registerSchema } from "../modules/auth/presentation/auth.schemas";
import { ArgonPasswordHasher } from "../modules/auth/infrastructure/argon-password.hasher";
import { JoseTokenService } from "../modules/auth/infrastructure/jose-token.service";
import { isOnboardingComplete, type OnboardingData } from "../modules/onboarding/domain/onboarding";
import {
  profileSchema,
  linksSchema,
  preferencesSchema,
} from "../modules/onboarding/presentation/onboarding.schemas";
const registration = {
  firstName: "Ana",
  lastName: "Díaz",
  email: "ana@example.com",
  password: "SecurePass1!",
  confirmPassword: "SecurePass1!",
};
test("registration validates every password requirement and confirmation", () => {
  for (const password of [
    "Short1!",
    "lowercase1!",
    "UPPERCASE1!",
    "NoNumbers!",
    "NoSymbols12",
    "        ",
  ])
    assert.equal(
      registerSchema.safeParse({ ...registration, password, confirmPassword: password }).success,
      false,
      password,
    );
  assert.equal(
    registerSchema.safeParse({ ...registration, confirmPassword: "Mismatch1!" }).success,
    false,
  );
  const result = registerSchema.parse({ ...registration, email: "ANA@EXAMPLE.COM" });
  assert.equal(result.email, "ana@example.com");
});
test("Argon2id hashes with fresh salt and verifies only the correct password", async () => {
  const hasher = new ArgonPasswordHasher();
  const hash = await hasher.hash(registration.password);
  assert.match(hash, /^\$argon2id\$/);
  assert.notEqual(hash, await hasher.hash(registration.password));
  assert.equal(await hasher.verify(hash, registration.password), true);
  assert.equal(await hasher.verify(hash, "wrong"), false);
});
test("jose validates signature, expiry and token purpose", async () => {
  const secret = "test-secret-at-least-thirty-two-characters-long";
  const tokens = new JoseTokenService(new ConfigService({ JWT_SECRET: secret }));
  const claims = { sub: randomUUID(), sid: randomUUID(), kind: "access" as const };
  const token = await tokens.sign(claims);
  assert.deepEqual(await tokens.verify(token, "access"), claims);
  await assert.rejects(tokens.verify(token, "refresh"));
  await assert.rejects(tokens.verify(`${token}tampered`, "access"));
  const expired = await new SignJWT({ sid: claims.sid, kind: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuer("jobs-api")
    .setAudience("jobs-web")
    .setExpirationTime(Math.floor(Date.now() / 1000) - 1)
    .sign(new TextEncoder().encode(secret));
  await assert.rejects(tokens.verify(expired, "access"));
});
test("onboarding requires professional data, skills and preferences; links are optional", () => {
  const data: OnboardingData = {
    profile: {
      professionalTitle: "Developer",
      country: "Chile",
      city: "Santiago",
      bio: "Interfaces accesibles",
      yearsOfExperience: 0,
    },
    preferences: {
      desiredRoles: ["Developer"],
      technologies: ["React"],
      preferredLocations: ["Chile"],
      modalities: ["Remote"],
      seniority: "Junior",
      minimumSalary: null,
      currency: "USD",
    },
    completed: false,
  };
  assert.equal(isOnboardingComplete(data), true);
  assert.equal(isOnboardingComplete({ ...data, profile: null }), false);
  assert.equal(
    isOnboardingComplete({ ...data, preferences: { ...data.preferences!, technologies: [] } }),
    false,
  );
  assert.equal(profileSchema.safeParse({ ...data.profile, yearsOfExperience: -1 }).success, false);
  assert.equal(
    preferencesSchema.safeParse({ ...data.preferences, minimumSalary: -1 }).success,
    false,
  );
  assert.equal(
    linksSchema.safeParse({ linkedinUrl: "javascript:alert(1)", githubUrl: "", portfolioUrl: "" })
      .success,
    false,
  );
  assert.equal(
    linksSchema.safeParse({ linkedinUrl: "", githubUrl: "", portfolioUrl: "" }).success,
    true,
  );
});
