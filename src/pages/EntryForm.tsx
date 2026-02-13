import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDataStore } from "../hooks/useDataStore";
import {
  useValidation,
  required,
  positiveNumber,
} from "../hooks/useValidation";
import { toDateStr } from "../dateFormat";
import "./EntryForm.css";

export function EntryForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useDataStore();
  const caloriesRef = useRef<HTMLInputElement>(null);
  const [calories, setCalories] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const rules = useMemo(
    () => ({
      calories: [required("Calories"), positiveNumber("Calories")],
    }),
    [],
  );
  const { errors, validate, clearError } = useValidation(rules);

  const date =
    (location.state as { date?: string } | null)?.date ?? toDateStr(new Date());

  useEffect(() => {
    caloriesRef.current?.focus();
  }, []);

  const handleSave = async () => {
    if (!validate({ calories })) return;

    setSaving(true);
    const now = Date.now();
    await store.entries.add({
      date,
      calories: parseInt(calories, 10),
      description: description.trim(),
      createdAt: now,
      sortOrder: now,
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
        <label htmlFor="description">Description (optional)</label>
        <input
          id="description"
          type="text"
          placeholder="What did you eat?"
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
