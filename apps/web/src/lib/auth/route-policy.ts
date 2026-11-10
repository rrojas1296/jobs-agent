export interface RouteUser {
  onboardingCompleted: boolean;
}
export function routeDestination(path: string, user: RouteUser | null): string | null {
  const auth = path === "/login" || path === "/register";
  if (!user) return auth ? null : "/login";
  if (!user.onboardingCompleted) return path === "/onboarding" ? null : "/onboarding";
  if (auth || path === "/" || path === "/onboarding") return "/dashboard";
  return null;
}
