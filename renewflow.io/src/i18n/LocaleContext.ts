// ─── Locale Context ───

import { createContext, useContext } from "react";
import { type Locale, type Translations, translations } from "./translations";

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: translations.en,
});

export const useLocale = (): LocaleContextValue => useContext(LocaleContext);
