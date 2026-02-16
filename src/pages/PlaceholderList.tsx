import { useNavigate } from "react-router-dom";
import { usePlaceholders } from "../hooks/usePlaceholders";
import { PlaceholderCard } from "../components/PlaceholderCard";
import "./PlaceholderList.css";
import { ADD, LEFT } from "../icons";
import { Header } from "../components/Header";

export function PlaceholderList() {
  const { placeholders, loading } = usePlaceholders();
  const navigate = useNavigate();

  return (
    <div className="placeholder-list">
      <Header
        title="Placeholders"
        leftIcon={
          <button
            className="header-icon"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            {LEFT}
          </button>
        }
      />
      <div className="placeholder-list-items">
        {loading ? (
          <p className="placeholder-empty">Loading...</p>
        ) : placeholders.length === 0 ? (
          <p className="placeholder-empty">No placeholders yet</p>
        ) : (
          placeholders.map((placeholder) => (
            <PlaceholderCard key={placeholder.id} placeholder={placeholder} />
          ))
        )}
      </div>

      <div className="placeholder-add-container">
        <button
          className="placeholder-add-button"
          onClick={() => navigate("/placeholders/add")}
        >
          {ADD} Add Placeholder
        </button>
      </div>
    </div>
  );
}
