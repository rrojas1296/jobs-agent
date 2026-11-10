import { redirect } from "next/navigation";
import { Brand } from "@/components/shared/brand";
import { ThemeSelect } from "@/components/shared/theme-select";
import { LogoutButton } from "@/components/shared/logout-button";
import { requireUser } from "@/lib/auth/server-user";
import { OnboardingContent } from "@/features/onboarding/components/onboarding-content";
export const metadata = { title: "Completa tu perfil" };
export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.onboardingCompleted) redirect("/dashboard");
  return (
    <div className="min-h-dvh">
      <header className="flex items-center justify-between border-b border-border bg-card px-5 py-4 sm:px-10">
        <Brand />
        <div className="flex items-center gap-2">
          <ThemeSelect />
          <LogoutButton />
        </div>
      </header>
      <main className="px-4 py-8 sm:px-8 sm:py-14">
        <OnboardingContent />
      </main>
    </div>
  );
}
