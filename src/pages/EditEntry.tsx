import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDataStore } from "../hooks/useDataStore";
import { useValidation, required, positiveNumber } from "../hooks/useValidation";
import type { FoodEntry } from "../types";
import "./EditEntry.css";

export function EditEntry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useDataStore();
  const [entry, setEntry] = useState<FoodEntry | null>(null);
  const [calories, setCalories] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const rules = useMemo(
    () => ({
      calories: [required("Calories"), positiveNumber("Calories")],
    }),
    [],
  );
  const { errors, validate, clearError } = useValidation(rules);

  useEffect(() => {
    async function loadEntry() {
      const found = await store.getEntryById(id!);
      if (found) {
        setEntry(found);
        setCalories(String(found.calories));
        setDescription(found.description);
      }
    }
    loadEntry();
  }, [id, store]);

  const handleSave = async () => {
    if (!entry) return;
    if (!validate({ calories })) return;

    setSaving(true);
    await store.updateEntry({
      ...entry,
      calories: parseInt(calories, 10),
      description: description.trim(),
    });
    navigate(-1);
  };

  const handleDelete = async () => {
    if (!entry) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await store.deleteEntry(entry.id);
    navigate(-1);
  };

  if (!entry) {
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
        <label htmlFor="description">Description (optional)</label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
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
