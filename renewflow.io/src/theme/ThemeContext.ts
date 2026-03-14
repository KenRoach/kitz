"use client";

import { createContext, useContext } from "react";
import { type ColorTokens, LIGHT } from "./tokens";

export interface ThemeContextValue {
  colors: ColorTokens;
  isDark: boolean;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  colors: LIGHT,
  isDark: false,
  toggle: () => {},
});

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);
