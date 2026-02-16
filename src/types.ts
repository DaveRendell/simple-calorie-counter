export interface FoodEntry {
  id: string;
  date: string; // "YYYY-MM-DD"
  calories: number;
  description: string;
  createdAt: number;
  sortOrder?: number;
  isFromPlaceholder?: boolean;
  calorieGoal?: number;
}

export interface Placeholder {
  id: string;
  description: string;
  calories: number;
  timeOfDay: string; // "HH:MM"
  sortOrder?: number;
}

export type ThemeMode = "light" | "dark" | "system";

export interface Settings {
  dailyCalorieTarget: number;
  theme: ThemeMode;
}
