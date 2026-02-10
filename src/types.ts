export interface FoodEntry {
  id: string;
  date: string; // "YYYY-MM-DD"
  calories: number;
  description: string;
  createdAt: number;
  sortOrder?: number;
}

export interface Settings {
  dailyCalorieTarget: number;
}
