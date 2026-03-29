import { create } from "zustand";

type Theme = "dark" | "light";

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("lf-theme", theme);
}

const savedTheme =
  (localStorage.getItem("lf-theme") as Theme | null) ??
  (window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark");

applyTheme(savedTheme);

export const useTheme = create<ThemeStore>((set) => ({
  theme: savedTheme,
  toggleTheme: () =>
    set((s) => {
      const next: Theme = s.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      return { theme: next };
    }),
}));
