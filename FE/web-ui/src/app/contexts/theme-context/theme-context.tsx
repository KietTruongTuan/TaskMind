"use client";
import { ThemeMode } from "@/app/enum/theme-mode.enum";
import { Box, Theme } from "@radix-ui/themes";
import { useState, useEffect, createContext, useContext } from "react";

const ThemeContext = createContext<{
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
} | null>(null);

export function ThemeSwitcher({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(ThemeMode.Dark);

  useEffect(() => {
    const savedMode = localStorage.getItem("theme") as ThemeMode;
    if (savedMode) setTheme(savedMode);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Theme
        appearance={theme}
        style={{
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
          fontSize: "var(--font-size-base)",
        }}
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
