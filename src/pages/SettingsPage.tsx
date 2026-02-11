import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../hooks/useSettings";
import "./SettingsPage.css";

export function SettingsPage() {
  const { settings, loading, updateSettings } = useSettings();
  const navigate = useNavigate();
  const [target, setTarget] = useState("");

  useEffect(() => {
    if (!loading) {
      setTarget(String(settings.dailyCalorieTarget));
    }
  }, [loading, settings.dailyCalorieTarget]);

  const handleBlur = () => {
    const val = parseInt(target, 10);
    if (val && val > 0) {
      updateSettings({ dailyCalorieTarget: val });
    } else {
      setTarget(String(settings.dailyCalorieTarget));
    }
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
          onChange={(e) => setTarget(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
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
