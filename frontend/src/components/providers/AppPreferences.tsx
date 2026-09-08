"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Language = "en" | "ar";
type Theme = "dark" | "light";

type Preferences = {
  language: Language;
  theme: Theme;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  toggleLanguage: () => void;
  toggleTheme: () => void;
};

const PreferencesContext = createContext<Preferences | null>(null);

function applyPreferences(language: Language, theme: Theme) {
  const root = document.documentElement;
  const body = document.body;

  root.classList.remove("light", "dark");
  root.classList.add(theme);

  body.classList.remove("light", "dark");
  body.classList.add(theme);

  root.dataset.theme = theme;
  root.lang = language;
  root.dir = language === "ar" ? "rtl" : "ltr";

  document.cookie = `fusionops-theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  document.cookie = `fusionops-language=${language}; path=/; max-age=31536000; SameSite=Lax`;
}

export function AppPreferences({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(
      "fusionops-language",
    ) as Language | null;

    const savedTheme = window.localStorage.getItem(
      "fusionops-theme",
    ) as Theme | null;

    const nextLanguage =
      savedLanguage === "ar" || savedLanguage === "en"
        ? savedLanguage
        : "en";

    const nextTheme =
      savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : "dark";

    setLanguageState(nextLanguage);
    setThemeState(nextTheme);
    applyPreferences(nextLanguage, nextTheme);
  }, []);

  useEffect(() => {
    applyPreferences(language, theme);
  }, [language, theme]);

  const value = useMemo<Preferences>(
    () => ({
      language,
      theme,

      setLanguage: (value) => {
        setLanguageState(value);
        window.localStorage.setItem("fusionops-language", value);
      },

      setTheme: (value) => {
        setThemeState(value);
        window.localStorage.setItem("fusionops-theme", value);
      },

      toggleLanguage: () => {
        setLanguageState((current) => {
          const next = current === "en" ? "ar" : "en";
          window.localStorage.setItem("fusionops-language", next);
          return next;
        });
      },

      toggleTheme: () => {
        setThemeState((current) => {
          const next = current === "dark" ? "light" : "dark";
          window.localStorage.setItem("fusionops-theme", next);
          return next;
        });
      },
    }),
    [language, theme],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function useAppPreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error(
      "useAppPreferences must be used inside AppPreferences",
    );
  }

  return context;
}
