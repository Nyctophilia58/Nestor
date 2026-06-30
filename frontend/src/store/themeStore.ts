import { create } from "zustand";

interface ThemeStore {
  dark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  dark: localStorage.getItem("theme") === "dark",

  toggle: () =>
    set((state) => {
      const newDark = !state.dark;
      localStorage.setItem("theme", newDark ? "dark" : "light");

      if (newDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      return { dark: newDark };
    }),
}));
