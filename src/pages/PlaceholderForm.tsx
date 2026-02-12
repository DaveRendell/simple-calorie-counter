import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDataStore } from "../hooks/useDataStore";
import {
  useValidation,
  required,
  positiveNumber,
} from "../hooks/useValidation";
import "./EntryForm.css";

export function PlaceholderForm() {
  const navigate = useNavigate();
  const store = useDataStore();
  const caloriesRef = useRef<HTMLInputElement>(null);
  const [calories, setCalories] = useState("");
  const [description, setDescription] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("12:00");
  const [saving, setSaving] = useState(false);

  const rules = useMemo(
    () => ({
      calories: [required("Calories"), positiveNumber("Calories")],
      description: [required("Description")],
    }),
    [],
  );
  const { errors, validate, clearError } = useValidation(rules);

  useEffect(() => {
    caloriesRef.current?.focus();
  }, []);

  const handleSave = async () => {
    if (!validate({ calories, description })) return;

    setSaving(true);
    await store.placeholders.add({
      calories: parseInt(calories, 10),
      description: description.trim(),
      timeOfDay,
    });
    navigate(-1);
  };

  return (
    <div className="entry-form">
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
        <label htmlFor="description">Description</label>
        <input
          id="description"
          type="text"
          placeholder="e.g. Breakfast"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            clearError("description");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? "description-error" : undefined
          }
        />
        {errors.description && (
          <span id="description-error" className="field-error" role="alert">
            {errors.description}
          </span>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="timeOfDay">Time of Day</label>
        <input
          id="timeOfDay"
          type="time"
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
        />
      </div>
      <button className="save-button" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
