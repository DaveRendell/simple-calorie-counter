import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDataStore } from "../hooks/useDataStore";
import "./EntryForm.css";

export function EntryForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useDataStore();
  const caloriesRef = useRef<HTMLInputElement>(null);
  const [calories, setCalories] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const date =
    (location.state as { date?: string } | null)?.date ??
    new Date().toISOString().split("T")[0];

  useEffect(() => {
    caloriesRef.current?.focus();
  }, []);

  const handleSave = async () => {
    const cal = parseInt(calories, 10);
    if (!cal || cal <= 0) return;

    setSaving(true);
    await store.addEntry({
      date,
      calories: cal,
      description: description.trim(),
      createdAt: Date.now(),
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
          onChange={(e) => setCalories(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
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
      <button
        className="save-button"
        onClick={handleSave}
        disabled={saving || !calories || parseInt(calories, 10) <= 0}
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
