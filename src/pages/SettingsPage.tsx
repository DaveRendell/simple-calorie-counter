import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDataStore } from "../hooks/useDataStore";
import { useSettings } from "../hooks/useSettings";
import type { FoodEntry, ThemeMode } from "../types";
import "./SettingsPage.css";

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

function entriesToCsv(entries: FoodEntry[]): string {
  const header =
    "id,date,calories,description,createdAt,sortOrder,isFromPlaceholder";
  const rows = entries.map((e) => {
    const desc =
      e.description.includes(",") || e.description.includes('"')
        ? `"${e.description.replace(/"/g, '""')}"`
        : e.description;
    return `${e.id},${e.date},${e.calories},${desc},${e.createdAt},${e.sortOrder ?? ""},${e.isFromPlaceholder ?? ""}`;
  });
  return [header, ...rows].join("\n");
}

function parseCsv(text: string): Omit<FoodEntry, never>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const entries: FoodEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of lines[i]) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    fields.push(current);

    if (fields.length < 5) continue;
    const entry: FoodEntry = {
      id: fields[0],
      date: fields[1],
      calories: Number(fields[2]),
      description: fields[3],
      createdAt: Number(fields[4]),
    };
    if (fields[5]) entry.sortOrder = Number(fields[5]);
    if (fields[6] === "true") entry.isFromPlaceholder = true;
    entries.push(entry);
  }
  return entries;
}

const CLEAR_TAPS_REQUIRED = 3;

export function SettingsPage() {
  const { settings, loading, updateSettings } = useSettings();
  const navigate = useNavigate();
  const store = useDataStore();
  const [editedTarget, setEditedTarget] = useState<string | null>(null);
  const [clearTaps, setClearTaps] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      <div className="settings-section">
        <h3 className="settings-section-heading">User Settings</h3>
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
        <button
          className="settings-link-button"
          onClick={() => navigate("/placeholders")}
        >
          Manage Meal Placeholders
        </button>
      </div>

      <div className="settings-section">
        <h3 className="settings-section-heading">Display</h3>
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
      </div>

      <div className="settings-section">
        <h3 className="settings-section-heading">Data Management</h3>
        {statusMessage && <p className="data-status">{statusMessage}</p>}
        <button
          className="settings-link-button"
          onClick={async () => {
            const entries = await store.entries.getAll();
            const csv = entriesToCsv(entries);
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "food-entries.csv";
            a.click();
            URL.revokeObjectURL(url);
            setStatusMessage(`Exported ${entries.length} entries.`);
          }}
        >
          Export Entries as CSV
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden-file-input"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const text = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsText(file);
            });
            const parsed = parseCsv(text);
            let added = 0;
            let updated = 0;
            for (const entry of parsed) {
              const existing = await store.entries.getById(entry.id);
              await store.entries.update(entry as FoodEntry);
              if (existing) {
                updated++;
              } else {
                added++;
              }
            }
            setStatusMessage(
              `Imported ${added} new entries, updated ${updated} existing.`,
            );
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />
        <button
          className="settings-link-button"
          onClick={() => fileInputRef.current?.click()}
        >
          Import Entries from CSV
        </button>
        <button
          className={`settings-link-button data-clear-btn${clearTaps > 0 ? " data-clear-btn--warning" : ""}`}
          onClick={async () => {
            const next = clearTaps + 1;
            if (next >= CLEAR_TAPS_REQUIRED) {
              const entries = await store.entries.getAll();
              for (const entry of entries) {
                await store.entries.delete(entry.id);
              }
              const placeholders = await store.placeholders.getAll();
              for (const p of placeholders) {
                await store.placeholders.delete(p.id);
              }
              setClearTaps(0);
              setStatusMessage("All data cleared.");
            } else {
              setClearTaps(next);
              setStatusMessage(
                `Tap ${CLEAR_TAPS_REQUIRED - next} more time${CLEAR_TAPS_REQUIRED - next > 1 ? "s" : ""} to clear all data.`,
              );
            }
          }}
        >
          {clearTaps === 0
            ? "Clear All Data"
            : `Tap ${CLEAR_TAPS_REQUIRED - clearTaps} More to Confirm`}
        </button>
        </div>
    </div>
  );
}
