import { test } from "node:test";
import assert from "node:assert/strict";
// Node 24 executes this pure TypeScript policy without a browser or a Next runtime.
import { routeDestination } from "./route-policy.ts";
const routes = [
  "/",
  "/login",
  "/register",
  "/onboarding",
  "/dashboard",
  "/jobs",
  "/applications",
  "/resumes",
  "/saved",
  "/settings",
];
test("anonymous users can access auth pages only", () => {
  for (const path of routes)
    assert.equal(
      routeDestination(path, null),
      ["/login", "/register"].includes(path) ? null : "/login",
    );
});
test("incomplete users always reach onboarding without a redirect loop", () => {
  for (const path of routes)
    assert.equal(
      routeDestination(path, { onboardingCompleted: false }),
      path === "/onboarding" ? null : "/onboarding",
    );
});
test("completed users reach dashboard; protected pages remain accessible", () => {
  for (const path of routes)
    assert.equal(
      routeDestination(path, { onboardingCompleted: true }),
      ["/", "/login", "/register", "/onboarding"].includes(path) ? "/dashboard" : null,
    );
});
