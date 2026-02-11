import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderApp } from "./helpers";
import { toDateStr } from "../../src/dateFormat";

describe("Placeholders", () => {
  beforeEach(() => {
    indexedDB = new IDBFactory();
  });

  it("should navigate to placeholder list from settings", async () => {
    const { user } = renderApp("/settings");
    const btn = await screen.findByText("Manage Meal Placeholders");
    await user.click(btn);
    expect(await screen.findByText("No placeholders yet")).toBeInTheDocument();
  });

  it("should add a placeholder", async () => {
    const { user } = renderApp("/placeholders");
    await screen.findByText("No placeholders yet");

    await user.click(screen.getByText("+ Add Placeholder"));

    const caloriesInput = await screen.findByLabelText("Calories");
    await user.type(caloriesInput, "400");

    const descInput = screen.getByLabelText("Description");
    await user.type(descInput, "Breakfast");

    await user.click(screen.getByText("Save"));

    expect(await screen.findByText("400 cal")).toBeInTheDocument();
    expect(screen.getByText("Breakfast")).toBeInTheDocument();
  });

  it("should edit a placeholder", async () => {
    const { store } = renderApp("/placeholders");

    await store.addPlaceholder({
      description: "Lunch",
      calories: 600,
      timeOfDay: "12:00",
    });

    const { user: user2 } = renderApp("/placeholders");
    const card = await screen.findByText("Lunch");
    await user2.click(card);

    const caloriesInput = await screen.findByLabelText("Calories");
    await vi.waitFor(() => expect(caloriesInput).toHaveValue(600));

    await user2.clear(caloriesInput);
    await user2.type(caloriesInput, "700");
    await user2.click(screen.getByText("Save"));

    expect(await screen.findByText("700 cal")).toBeInTheDocument();
  });

  it("should delete a placeholder with two-tap confirmation", async () => {
    const { store } = renderApp("/placeholders");
    await store.addPlaceholder({
      description: "Snack",
      calories: 200,
      timeOfDay: "15:00",
    });

    const { user } = renderApp("/placeholders");
    const card = await screen.findByText("Snack");
    await user.click(card);

    await screen.findByLabelText("Calories");

    const deleteBtn = screen.getByText("Delete");
    await user.click(deleteBtn);
    expect(screen.getByText("Tap again to confirm")).toBeInTheDocument();

    await user.click(screen.getByText("Tap again to confirm"));

    expect(await screen.findByText("No placeholders yet")).toBeInTheDocument();
  });

  it("should require description for placeholders", async () => {
    const { user } = renderApp("/placeholders/add");

    const caloriesInput = await screen.findByLabelText("Calories");
    await user.type(caloriesInput, "400");

    await user.click(screen.getByText("Save"));
    expect(
      await screen.findByText("Description is required"),
    ).toBeInTheDocument();
  });

  it("should auto-populate entries from placeholders on empty today", async () => {
    // Set up placeholders before rendering DayView to avoid race conditions
    const { store } = renderApp("/settings");
    await store.addPlaceholder({
      description: "Breakfast",
      calories: 400,
      timeOfDay: "08:00",
    });
    await store.addPlaceholder({
      description: "Lunch",
      calories: 600,
      timeOfDay: "12:00",
    });

    renderApp("/");
    await screen.findByText("Today");

    expect(await screen.findByText("Breakfast")).toBeInTheDocument();
    expect(screen.getByText("Lunch")).toBeInTheDocument();
    expect(screen.getByText("400 cal")).toBeInTheDocument();
    expect(screen.getByText("600 cal")).toBeInTheDocument();
  });

  it("should not auto-populate when entries already exist", async () => {
    // Set up data before rendering DayView to avoid race conditions
    const { store } = renderApp("/settings");
    const today = toDateStr(new Date());
    const now = Date.now();

    await store.addPlaceholder({
      description: "Breakfast",
      calories: 400,
      timeOfDay: "08:00",
    });
    await store.addEntry({
      date: today,
      calories: 300,
      description: "Oatmeal",
      createdAt: now,
    });

    renderApp("/");
    await screen.findByText("Today");

    expect(await screen.findByText("Oatmeal")).toBeInTheDocument();
    // Should only have the manual entry, not a placeholder-generated one
    await waitFor(() => {
      expect(screen.queryByText("Breakfast")).not.toBeInTheDocument();
    });
  });

  it("should clear isFromPlaceholder when editing a placeholder entry", async () => {
    const { store } = renderApp("/settings");
    const today = toDateStr(new Date());
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    const ts = d.getTime();

    const entry = await store.addEntry({
      date: today,
      calories: 400,
      description: "Breakfast",
      createdAt: ts,
      sortOrder: ts,
      isFromPlaceholder: true,
    });

    const { user } = renderApp(`/edit/${entry.id}`);
    const caloriesInput = await screen.findByLabelText("Calories");
    await vi.waitFor(() => expect(caloriesInput).toHaveValue(400));

    await user.clear(caloriesInput);
    await user.type(caloriesInput, "450");
    await user.click(screen.getByText("Save"));

    const updated = await store.getEntryById(entry.id);
    expect(updated!.calories).toBe(450);
    expect(updated!.isFromPlaceholder).toBe(false);
  });

  it("should exclude placeholder entries from recent entries", async () => {
    // Set up data before rendering to avoid DayView race conditions
    const { store } = renderApp("/settings");
    const now = Date.now();

    await store.addEntry({
      date: "2024-01-15",
      calories: 300,
      description: "Oatmeal",
      createdAt: now,
    });
    await store.addEntry({
      date: "2024-01-15",
      calories: 400,
      description: "Breakfast Placeholder",
      createdAt: now + 1,
      isFromPlaceholder: true,
    });

    renderApp("/recent");
    expect(await screen.findByText("Oatmeal")).toBeInTheDocument();
    expect(
      screen.queryByText("Breakfast Placeholder"),
    ).not.toBeInTheDocument();
  });
});
