"use client";

import { getTranslation } from "@/lib/i18n";
import { useAppPreferences } from "@/components/providers/AppPreferences";

export function useTranslation() {
  const { language } = useAppPreferences();

  return {
    language,
    t: getTranslation(language),
  };
}
