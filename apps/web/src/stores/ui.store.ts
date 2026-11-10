import { create } from "zustand";
export type Theme = "light" | "dark" | "system";
interface UiState {
  theme: Theme;
  collapsed: boolean;
  mobileOpen: boolean;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setMobileOpen: (open: boolean) => void;
}
export const useUiStore = create<UiState>((set) => ({
  theme: "system",
  collapsed: false,
  mobileOpen: false,
  setTheme: (theme) => {
    try {
      localStorage.setItem("jobs-theme", theme);
    } catch {
      /* Storage may be disabled. */
    }
    set({ theme });
  },
  toggleSidebar: () => set((state) => ({ collapsed: !state.collapsed })),
  setMobileOpen: (mobileOpen) => set({ mobileOpen }),
}));
