import { useCallback, useEffect, useState } from "react";

import {
  STORAGE_KEY,
  ThemeContext,
  applyTheme,
  getPreferredTheme,
  storeTheme,
} from "./themeStore";

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getPreferredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Follow the OS preference only while the user has made no explicit choice.
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return;

    const onChange = (event) => {
      try {
        if (localStorage.getItem(STORAGE_KEY)) return;
      } catch {
        // ignore
      }
      setThemeState(event.matches ? "dark" : "light");
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((next) => {
    const value = next === "dark" ? "dark" : "light";
    setThemeState(value);
    storeTheme(value);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const value = current === "dark" ? "light" : "dark";
      storeTheme(value);
      return value;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
