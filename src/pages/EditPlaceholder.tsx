import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDataStore } from "../hooks/useDataStore";
import {
  useValidation,
  required,
  positiveNumber,
} from "../hooks/useValidation";
import type { Placeholder } from "../types";
import "./EditEntry.css";

export function EditPlaceholder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useDataStore();
  const [placeholder, setPlaceholder] = useState<Placeholder | null>(null);
  const [calories, setCalories] = useState("");
  const [description, setDescription] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("12:00");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const rules = useMemo(
    () => ({
      calories: [required("Calories"), positiveNumber("Calories")],
      description: [required("Description")],
    }),
    [],
  );
  const { errors, validate, clearError } = useValidation(rules);

  useEffect(() => {
    async function loadPlaceholder() {
      const found = await store.placeholders.getById(id!);
      if (found) {
        setPlaceholder(found);
        setCalories(String(found.calories));
        setDescription(found.description);
        setTimeOfDay(found.timeOfDay);
      }
    }
    loadPlaceholder();
  }, [id, store]);

  const handleSave = async () => {
    if (!placeholder) return;
    if (!validate({ calories, description })) return;

    setSaving(true);
    await store.placeholders.update({
      ...placeholder,
      calories: parseInt(calories, 10),
      description: description.trim(),
      timeOfDay,
    });
    navigate(-1);
  };

  const handleDelete = async () => {
    if (!placeholder) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await store.placeholders.delete(placeholder.id);
    navigate(-1);
  };

  if (!placeholder) {
    return (
      <div className="edit-entry">
        <p className="loading">Loading...</p>
      </div>
    );
  }

  return (
    <div className="edit-entry">
      <div className="form-field">
        <label htmlFor="calories">Calories</label>
        <input
          id="calories"
          type="number"
          inputMode="numeric"
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
      <button className="delete-button" onClick={handleDelete}>
        {confirmDelete ? "Tap again to confirm" : "Delete"}
      </button>
    </div>
  );
}
