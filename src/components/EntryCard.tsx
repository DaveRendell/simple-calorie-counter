import { useNavigate } from "react-router-dom";
import type { FoodEntry } from "../types";
import "./EntryCard.css";

export function EntryCard({ entry }: { entry: FoodEntry }) {
  const navigate = useNavigate();

  return (
    <button
      className="entry-card"
      onClick={() => navigate(`/edit/${entry.id}`)}
    >
      <span className="entry-calories">{entry.calories} cal</span>
      <span className="entry-description">
        {entry.description || "No description"}
      </span>
    </button>
  );
}
