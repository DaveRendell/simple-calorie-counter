import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDataStore } from "../hooks/useDataStore";
import { useSettings } from "../hooks/useSettings";
import {
  useValidation,
  required,
  positiveNumber,
} from "../hooks/useValidation";
import { toDateStr } from "../dateFormat";
import { LEFT } from "../icons";
import { Header } from "../components/Header";
import "./EntryForm.css";

type EntryType = "food" | "exercise";

export function EntryForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useDataStore();
  const { settings } = useSettings();
  const caloriesRef = useRef<HTMLInputElement>(null);
  const state = location.state as {
    date?: string;
    calories?: string;
    description?: string;
  } | null;
  const [entryType, setEntryType] = useState<EntryType>("food");
  const [calories, setCalories] = useState(state?.calories ?? "");
  const [multiplier, setMultiplier] = useState("1.0");
  const [description, setDescription] = useState(state?.description ?? "");
  const [saving, setSaving] = useState(false);

  const rules = useMemo(
    () => ({
      calories: [required("Calories"), positiveNumber("Calories")],
      multiplier: [
        required("Serving multiplier"),
        positiveNumber("Serving multiplier"),
      ],
    }),
    [],
  );
  const { errors, validate, clearError } = useValidation(rules);

  const date = state?.date ?? toDateStr(new Date());

  useEffect(() => {
    caloriesRef.current?.focus();
  }, []);

  const handleSave = async () => {
    if (!validate({ calories, multiplier })) return;

    setSaving(true);
    const now = Date.now();
    await store.entries.add({
      date,
      calories:
        Math.round(parseInt(calories, 10) * parseFloat(multiplier)) *
        (entryType === "exercise" ? -1 : 1),
      description: description.trim(),
      createdAt: now,
      sortOrder: now,
      calorieGoal: settings.dailyCalorieTarget,
    });
    navigate("/", { state: { date } });
  };

  return (
    <div className="entry-form">
      <Header
        title="Add Entry"
        leftIcon={
          <button
            className="header-icon"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            {LEFT}
          </button>
        }
      />
      <div
        className="entry-type-toggle"
        role="radiogroup"
        aria-label="Entry type"
      >
        {(["food", "exercise"] as const).map((type) => (
          <button
            key={type}
            role="radio"
            aria-checked={entryType === type}
            className={`entry-type-toggle-btn${entryType === type ? " entry-type-toggle-btn--active" : ""}`}
            onClick={() => setEntryType(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      <div className="form-field">
        <label htmlFor="calories">Calories</label>
        <input
          id="calories"
          ref={caloriesRef}
          type="number"
          inputMode="numeric"
          placeholder="0"
          value={calories}
          onChange={(e) => {
            setCalories(e.target.value);
            clearError("calories");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          aria-invalid={!!errors.calories}
          aria-describedby={errors.calories ? "calories-error" : undefined}
        />
        {errors.calories && (
          <span id="calories-error" className="field-error" role="alert">
            {errors.calories}
          </span>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="multiplier">Serving multiplier</label>
        <input
          id="multiplier"
          type="number"
          inputMode="numeric"
          placeholder="1.0"
          step="0.1"
          value={multiplier}
          onChange={(e) => {
            setMultiplier(e.target.value);
            clearError("multiplier");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          aria-invalid={!!errors.multiplier}
          aria-describedby={errors.multiplier ? "multiplier-error" : undefined}
        />
        {errors.multiplier && (
          <span id="multiplier-error" className="field-error" role="alert">
            {errors.multiplier}
          </span>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="description">Description (optional)</label>
        <input
          id="description"
          type="text"
          placeholder={
            entryType === "exercise" ? "What did you do?" : "What did you eat?"
          }
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
      </div>
      <button className="save-button" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
