import { createContext } from "react";
import type { Settings } from "../types";

export interface SettingsContextValue {
  settings: Settings;
  loading: boolean;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
  dailyCalorieTarget: 2000,
  theme: "system",
};

export const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  loading: true,
  updateSettings: async () => {},
});
