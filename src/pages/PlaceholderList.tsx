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
import { usePlaceholders } from "../hooks/usePlaceholders";
import { PlaceholderCard } from "../components/PlaceholderCard";
import "./PlaceholderList.css";
import { ADD } from "../icons";

export function PlaceholderList() {
  const { placeholders, loading, reorderPlaceholders } = usePlaceholders();
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = placeholders.findIndex((p) => p.id === active.id);
    const newIndex = placeholders.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(placeholders, oldIndex, newIndex);
    reorderPlaceholders(newOrder.map((p) => p.id));
  };

  return (
    <div className="placeholder-list">
      <div className="placeholder-list-items">
        {loading ? (
          <p className="placeholder-empty">Loading...</p>
        ) : placeholders.length === 0 ? (
          <p className="placeholder-empty">No placeholders yet</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={placeholders.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {placeholders.map((placeholder) => (
                <PlaceholderCard
                  key={placeholder.id}
                  placeholder={placeholder}
                />
              ))}
            </SortableContext>
          </DndContext>
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
