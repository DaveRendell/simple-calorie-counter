import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePlaceholder } from "../hooks/usePlaceholder";
import {
  useValidation,
  required,
  positiveNumber,
} from "../hooks/useValidation";
import { LEFT } from "../icons";
import { Header } from "../components/Header";
import "./EditEntry.css";

export function EditPlaceholder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { placeholder, updatePlaceholder, deletePlaceholder } =
    usePlaceholder(id);
  const [calories, setCalories] = useState("");
  const [description, setDescription] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("12:00");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const rules = useMemo(
    () => ({
      calories: [required("Calories"), positiveNumber("Calories")],
      description: [required("Description")],
    }),
    [],
  );
  const { errors, validate, clearError } = useValidation(rules);

  if (placeholder && !initialized) {
    setCalories(String(placeholder.calories));
    setDescription(placeholder.description);
    setTimeOfDay(placeholder.timeOfDay);
    setInitialized(true);
  }

  const handleSave = async () => {
    if (!placeholder) return;
    if (!validate({ calories, description })) return;

    setSaving(true);
    await updatePlaceholder({
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
    await deletePlaceholder();
    navigate(-1);
  };

  const backButton = (
    <button
      className="header-icon"
      onClick={() => navigate(-1)}
      aria-label="Back"
    >
      {LEFT}
    </button>
  );

  if (!placeholder) {
    return (
      <div className="edit-entry">
        <Header title="Edit Placeholder" leftIcon={backButton} />
        <p className="loading">Loading...</p>
      </div>
    );
  }

  return (
    <div className="edit-entry">
      <Header title="Edit Placeholder" leftIcon={backButton} />
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
