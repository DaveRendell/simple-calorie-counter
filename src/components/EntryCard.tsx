import { useNavigate } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FoodEntry } from "../types";
import "./EntryCard.css";

export function EntryCard({ entry }: { entry: FoodEntry }) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`entry-card${isDragging ? " entry-card--dragging" : ""}`}
    >
      <span
        className="drag-handle"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        ≡
      </span>
      <button
        className="entry-card-content"
        onClick={() => navigate(`/edit/${entry.id}`)}
      >
        <span className="entry-calories">{entry.calories} cal</span>
        <span className="entry-description">
          {entry.description || "No description"}
        </span>
      </button>
    </div>
  );
}
