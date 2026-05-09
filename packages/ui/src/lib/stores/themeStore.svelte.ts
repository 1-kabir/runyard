export type Theme = "light" | "dark";

function createThemeStore() {
  let currentTheme = $state<Theme>("light");

  function init() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("runyard:theme") as Theme | null;
      if (saved === "light" || saved === "dark") {
        currentTheme = saved;
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        currentTheme = prefersDark ? "dark" : "light";
      }
      applyTheme(currentTheme);
    }
  }

  function applyTheme(theme: Theme) {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
    }
  }

  return {
    get theme() {
      return currentTheme;
    },
    toggle() {
      currentTheme = currentTheme === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        localStorage.setItem("runyard:theme", currentTheme);
      }
      applyTheme(currentTheme);
    },
    init
  };
}

export const themeStore = createThemeStore();
