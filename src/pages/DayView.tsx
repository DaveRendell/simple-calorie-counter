import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useEntries } from "../hooks/useEntries";
import { useSettings } from "../hooks/useSettings";
import { useDataStore } from "../hooks/useDataStore";
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
  const { entries, totalCalories, loading, reorderEntries, refresh } =
    useEntries(date);
  const { settings } = useSettings();
  const store = useDataStore();
  const navigate = useNavigate();
  const isToday = date === getToday();
  const populatedRef = useRef(false);

  useEffect(() => {
    populatedRef.current = false;
  }, [date]);

  useEffect(() => {
    if (loading || !isToday || populatedRef.current) return;
    populatedRef.current = true;

    (async () => {
      // Query the DB directly — React state may be stale after a date change
      const currentEntries = await store.getEntriesByDate(date);
      if (currentEntries.length > 0) return;

      const placeholders = await store.getPlaceholders();
      if (placeholders.length === 0) return;

      for (const p of placeholders) {
        const [h, m] = p.timeOfDay.split(":").map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        const ts = d.getTime();
        await store.addEntry({
          date,
          calories: p.calories,
          description: p.description,
          createdAt: ts,
          sortOrder: ts,
          isFromPlaceholder: true,
        });
      }
      refresh();
    })();
  }, [loading, isToday, date, store, refresh]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = entries.findIndex((e) => e.id === active.id);
    const newIndex = entries.findIndex((e) => e.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(entries, oldIndex, newIndex);
    reorderEntries(newOrder.map((e) => e.id));
  };

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={entries.map((e) => e.id)}
              strategy={verticalListSortingStrategy}
            >
              {entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  variant={entry.isFromPlaceholder ? "placeholder" : "default"}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="add-button-container">
        <button
          className="add-button"
          onClick={() => navigate("/add", { state: { date } })}
        >
          + Add Entry
        </button>
        <button
          className="recent-button"
          onClick={() => navigate("/recent", { state: { date } })}
        >
          Recent
        </button>
      </div>
    </div>
  );
}
