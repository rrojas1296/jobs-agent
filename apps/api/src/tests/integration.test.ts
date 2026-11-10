import "reflect-metadata";
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { createApp } from "../bootstrap";
import { DrizzleService } from "../database/drizzle/drizzle.service";
import { users } from "../database/drizzle/schemas/users";
import { sessions } from "../database/drizzle/schemas/sessions";
import type { PublicUser } from "../modules/users/domain/user";
import type { OnboardingData } from "../modules/onboarding/domain/onboarding";
// Requires an explicitly configured, migrated development/test PostgreSQL database. Deletes its own user.
test("HTTP + PostgreSQL: auth, rotation, revocation, CSRF and persisted onboarding", async (t) => {
  const app = await createApp();
  await app.listen(0, "127.0.0.1");
  const url = await app.getUrl();
  const jar = new Map<string, string>();
  const email = `integration-${randomUUID()}@example.com`;
  let userId: string | undefined;
  async function request(
    path: string,
    method = "GET",
    body?: unknown,
    cookies?: string,
    origin = "http://localhost:3000",
  ) {
    const response = await fetch(`${url}${path}`, {
      method,
      headers: {
        cookie: cookies ?? [...jar].map(([key, value]) => `${key}=${value}`).join("; "),
        origin,
        "x-requested-with": "jobs-web",
        "content-type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    for (const entry of response.headers.getSetCookie()) {
      const pair = entry.split(";")[0]!;
      const index = pair.indexOf("=");
      jar.set(pair.slice(0, index), pair.slice(index + 1));
    }
    return response;
  }
  try {
    await t.test("anonymous routes and CSRF are rejected", async () => {
      assert.equal((await request("/auth/me")).status, 401);
      assert.equal((await request("/onboarding")).status, 401);
      assert.equal(
        (await request("/auth/login", "POST", {}, "", "https://attacker.example")).status,
        403,
      );
    });
    const input = {
      email,
      firstName: "Integration",
      lastName: "Test",
      password: "SecurePass1!",
      confirmPassword: "SecurePass1!",
    };
    await t.test(
      "registration creates hashed user and HttpOnly cookies without leaking tokens",
      async () => {
        assert.equal(
          (
            await request("/auth/register", "POST", {
              ...input,
              password: "weak",
              confirmPassword: "weak",
            })
          ).status,
          400,
        );
        const response = await request("/auth/register", "POST", input);
        assert.equal(response.status, 201);
        const user = (await response.json()) as PublicUser;
        userId = user.id;
        assert.equal("passwordHash" in user, false);
        assert.equal("accessToken" in user, false);
        assert.equal(user.onboardingCompleted, false);
        for (const cookie of response.headers.getSetCookie()) {
          assert.match(cookie, /HttpOnly/);
          assert.match(cookie, /SameSite=Lax/);
        }
        const stored = await app
          .get(DrizzleService)
          .db.query.users.findFirst({ where: eq(users.id, user.id) });
        assert.match(stored!.passwordHash, /^\$argon2id\$/);
        const session = await app
          .get(DrizzleService)
          .db.query.sessions.findFirst({ where: eq(sessions.userId, user.id) });
        assert.notEqual(session!.refreshTokenHash, jar.get("refresh_token"));
        assert.equal(session!.refreshTokenHash.length, 64);
        assert.equal((await request("/auth/register", "POST", input)).status, 409);
        assert.equal((await request("/dashboard")).status, 403);
      },
    );
    await t.test("all onboarding steps persist and completion is validated", async () => {
      assert.equal((await request("/onboarding/complete", "POST", {})).status, 400);
      assert.equal(
        (
          await request("/onboarding/profile", "PATCH", {
            professionalTitle: "Engineer",
            yearsOfExperience: 2,
            country: "Chile",
            city: "Santiago",
            bio: "Building accessible apps",
          })
        ).status,
        200,
      );
      assert.equal(
        (await request("/onboarding/skills", "PATCH", { technologies: ["React", "TypeScript"] }))
          .status,
        200,
      );
      assert.equal(
        (
          await request("/onboarding/preferences", "PATCH", {
            desiredRoles: ["Frontend Developer"],
            preferredLocations: ["Chile"],
            modalities: ["Remote"],
            seniority: "Mid",
            minimumSalary: null,
            currency: "USD",
          })
        ).status,
        200,
      );
      const data = (await (await request("/onboarding")).json()) as OnboardingData;
      assert.equal(data.profile?.professionalTitle, "Engineer");
      assert.deepEqual(data.preferences?.technologies, ["React", "TypeScript"]);
      assert.equal(
        (
          await request("/onboarding/links", "PATCH", {
            linkedinUrl: "javascript:alert(1)",
            githubUrl: "",
            portfolioUrl: "",
          })
        ).status,
        400,
      );
      assert.equal(
        (
          await request("/onboarding/links", "PATCH", {
            linkedinUrl: "",
            githubUrl: "https://github.com/example",
            portfolioUrl: "",
          })
        ).status,
        200,
      );
      assert.equal((await request("/onboarding/complete", "POST", {})).status, 201);
      assert.equal(
        ((await (await request("/auth/me")).json()) as PublicUser).onboardingCompleted,
        true,
      );
      const dashboard = await request("/dashboard");
      assert.equal(dashboard.status, 200);
      assert.deepEqual(await dashboard.json(), {
        statistics: { found: 0, compatible: 0, applications: 0, resumes: 0 },
        activity: [],
      });
    });
    await t.test("refresh rotates atomically, replay invalidates the session", async () => {
      const original = jar.get("refresh_token")!;
      assert.equal((await request("/auth/refresh", "POST", {})).status, 204);
      assert.notEqual(jar.get("refresh_token"), original);
      assert.equal((await request("/auth/me")).status, 200);
      assert.equal(
        (await request("/auth/refresh", "POST", {}, `refresh_token=${original}`)).status,
        401,
      );
      assert.equal((await request("/auth/me")).status, 401);
    });
    await t.test("login checks credentials; logout revokes access and clears cookies", async () => {
      assert.equal(
        (await request("/auth/login", "POST", { email, password: "wrong" })).status,
        401,
      );
      assert.equal(
        (await request("/auth/login", "POST", { email, password: input.password })).status,
        200,
      );
      const access = jar.get("access_token")!;
      const refresh = jar.get("refresh_token")!;
      const response = await request("/auth/logout", "POST", {});
      assert.equal(response.status, 204);
      for (const cookie of response.headers.getSetCookie())
        assert.match(cookie, /Expires=Thu, 01 Jan 1970/);
      assert.equal(
        (await request("/auth/me", "GET", undefined, `access_token=${access}`)).status,
        401,
      );
      assert.equal(
        (await request("/auth/refresh", "POST", {}, `refresh_token=${refresh}`)).status,
        401,
      );
    });
  } finally {
    if (userId) await app.get(DrizzleService).db.delete(users).where(eq(users.id, userId));
    await app.close();
  }
});
