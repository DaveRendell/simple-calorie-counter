import { useNavigate } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Placeholder } from "../types";
import "./EntryCard.css";

export function PlaceholderCard({ placeholder }: { placeholder: Placeholder }) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: placeholder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`entry-card entry-card--placeholder${isDragging ? " entry-card--dragging" : ""}`}
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
        onClick={() => navigate(`/placeholders/edit/${placeholder.id}`)}
      >
        <span className="entry-calories">{placeholder.calories} cal</span>
        <span className="entry-description">{placeholder.description}</span>
        <span className="entry-time">{placeholder.timeOfDay}</span>
      </button>
    </div>
  );
}
