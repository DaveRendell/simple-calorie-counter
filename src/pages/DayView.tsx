import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEntries } from "../hooks/useEntries";
import { useSettings } from "../hooks/useSettings";
import { EntryCard } from "../components/EntryCard";
import { ProgressBar } from "../components/ProgressBar";
import { toDateStr } from "../dateFormat";
import "./DayView.css";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getToday(): string {
  return toDateStr(new Date());
}

function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return toDateStr(date);
}

export function DayView() {
  const [date, setDate] = useState(getToday);
  const { entries, totalCalories, loading } = useEntries(date);
  const { settings } = useSettings();
  const navigate = useNavigate();
  const isToday = date === getToday();

  return (
    <div className="day-view">
      <div className="date-nav">
        <button
          className="date-arrow"
          onClick={() => setDate((d) => addDays(d, -1))}
          aria-label="Previous day"
        >
          &larr;
        </button>
        <span className="date-label">
          {isToday ? "Today" : formatDate(date)}
        </span>
        <button
          className="date-arrow"
          onClick={() => setDate((d) => addDays(d, 1))}
          aria-label="Next day"
        >
          &rarr;
        </button>
      </div>

      <ProgressBar
        current={totalCalories}
        target={settings.dailyCalorieTarget}
      />

      <div className="entries-list">
        {loading ? (
          <p className="entries-empty">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="entries-empty">No entries yet</p>
        ) : (
          entries.map((entry) => <EntryCard key={entry.id} entry={entry} />)
        )}
      </div>

      <div className="add-button-container">
        <button
          className="add-button"
          onClick={() => navigate("/add", { state: { date } })}
        >
          + Add Entry
        </button>
      </div>
    </div>
  );
}
