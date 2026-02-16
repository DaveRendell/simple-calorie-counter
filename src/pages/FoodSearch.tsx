import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toDateStr } from "../dateFormat";
import { searchFoods, type FoodSearchResult } from "../api/searchFoods";
import { LEFT } from "../icons";
import { Header } from "../components/Header";
import "./FoodSearch.css";

export function FoodSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const date =
    (location.state as { date?: string } | null)?.date ?? toDateStr(new Date());

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const data = await searchFoods(trimmed);
      setResults(data);
    } catch {
      setError("Failed to search. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: FoodSearchResult) => {
    navigate("/add", {
      state: {
        date,
        calories: String(result.calories),
        description: result.name,
      },
    });
  };

  return (
    <div className="food-search">
      <Header
        title="Food Search"
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
      <form className="food-search-form" onSubmit={handleSearch}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search foods..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={loading}>
          {loading ? "..." : "Search"}
        </button>
      </form>

      {error && <p className="food-search-error">{error}</p>}

      <div className="food-search-list">
        {loading ? (
          <p className="food-search-empty">Searching...</p>
        ) : searched && results.length === 0 && !error ? (
          <p className="food-search-empty">No results found</p>
        ) : (
          results.map((result, i) => (
            <div
              key={i}
              className="food-search-item"
              onClick={() => handleSelect(result)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleSelect(result)}
            >
              <div className="food-search-item-info">
                <span className="food-search-item-name">{result.name}</span>
                <span className="food-search-item-serving">
                  {result.servingSize}
                </span>
              </div>
              <span className="food-search-item-cal">
                {result.calories} cal
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
