import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDataStore } from "../hooks/useDataStore";
import { toDateStr } from "../dateFormat";
import type { FoodEntry } from "../types";
import "./RecentEntries.css";
import { ADD } from "../icons";

export function RecentEntries() {
  const store = useDataStore();
  const navigate = useNavigate();
  const location = useLocation();
  const date =
    (location.state as { date?: string } | null)?.date ?? toDateStr(new Date());

  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    store.getRecentEntries().then((result) => {
      setEntries(result);
      setLoading(false);
    });
  }, [store]);

  const filtered = search
    ? entries.filter((e) =>
        e.description.toLowerCase().includes(search.toLowerCase()),
      )
    : entries;

  const handleAdd = async (entry: FoodEntry) => {
    const now = Date.now();
    await store.addEntry({
      date,
      calories: entry.calories,
      description: entry.description,
      createdAt: now,
      sortOrder: now,
    });
    navigate(-1);
  };

  return (
    <div className="recent-entries">
      <input
        className="recent-search"
        type="text"
        placeholder="Search recent entries..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="recent-list">
        {loading ? (
          <p className="recent-empty">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="recent-empty">No recent entries found</p>
        ) : (
          filtered.map((entry) => (
            <div key={entry.id} className="recent-item">
              <div className="recent-item-info">
                <span className="recent-item-desc">{entry.description}</span>
                <span className="recent-item-cal">{entry.calories} cal</span>
              </div>
              <button
                className="recent-add-btn"
                onClick={() => handleAdd(entry)}
                aria-label={`Add ${entry.description}`}
              >
                {ADD}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
