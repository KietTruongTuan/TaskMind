"use client";
import { ThemeMode } from "@/app/enum/theme-mode.enum";
import { Theme } from "@radix-ui/themes";
import { useState, useEffect, createContext, useContext } from "react";

const ThemeContext = createContext<{
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const currentTheme = localStorage.getItem("theme") as ThemeMode;
  const [theme, setTheme] = useState<ThemeMode>(currentTheme ?? ThemeMode.Light);

  useEffect(() => {
    const savedMode = localStorage.getItem("theme") as ThemeMode;
    if (savedMode) setTheme(savedMode);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = document.documentElement;
    root.classList.remove(ThemeMode.Light, ThemeMode.Dark);
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Theme
        appearance={theme}
        style={{
          backgroundColor: "var(--background)",
          color: "var(--text-primary)",
          fontSize: "var(--font-size-base)",
          height: "100%",
        }}
        id="theme-root"
      >
        {children}
      </Theme>
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
