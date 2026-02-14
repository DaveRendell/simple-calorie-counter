import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../hooks/useSettings";
import type { ThemeMode } from "../types";
import "./SettingsPage.css";

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function SettingsPage() {
  const { settings, loading, updateSettings } = useSettings();
  const navigate = useNavigate();
  const [editedTarget, setEditedTarget] = useState<string | null>(null);

  const target = editedTarget ?? String(settings.dailyCalorieTarget);

  const handleBlur = () => {
    const val = parseInt(target, 10);
    if (val && val > 0) {
      updateSettings({ dailyCalorieTarget: val });
    }
    setEditedTarget(null);
  };

  if (loading) return null;

  return (
    <div className="settings-page">
      <div className="form-field">
        <label htmlFor="target">Daily Calorie Target</label>
        <input
          id="target"
          type="number"
          inputMode="numeric"
          value={target}
          onChange={(e) => setEditedTarget(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
      </div>
      <div className="form-field">
        <label>Theme</label>
        <div className="theme-toggle" role="radiogroup" aria-label="Theme">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="radio"
              aria-checked={settings.theme === opt.value}
              className={`theme-toggle-btn${settings.theme === opt.value ? " theme-toggle-btn--active" : ""}`}
              onClick={() => updateSettings({ theme: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <button
        className="settings-link-button"
        onClick={() => navigate("/placeholders")}
      >
        Manage Meal Placeholders
      </button>
    </div>
  );
}
