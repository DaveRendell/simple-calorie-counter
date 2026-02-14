import { useNavigate } from "react-router-dom";
import type { Placeholder } from "../types";
import "./EntryCard.css";

export function PlaceholderCard({ placeholder }: { placeholder: Placeholder }) {
  const navigate = useNavigate();

  return (
    <div className="entry-card entry-card--placeholder">
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
