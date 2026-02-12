import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderApp } from "./helpers";

describe("RecentEntries", () => {
  beforeEach(() => {
    indexedDB = new IDBFactory();
  });

  it("should navigate to recent entries page from DayView", async () => {
    const { user } = renderApp();
    await screen.findByText("Today");

    await user.click(screen.getByLabelText("Recent entries"));
    expect(
      await screen.findByPlaceholderText("Search recent entries..."),
    ).toBeInTheDocument();
  });

  it("should show previously added entries with descriptions", async () => {
    const { store } = renderApp("/recent");
    const now = Date.now();
    await store.addEntry({
      date: "2024-01-15",
      calories: 300,
      description: "Oatmeal",
      createdAt: now,
    });
    await store.addEntry({
      date: "2024-01-15",
      calories: 500,
      description: "Chicken Salad",
      createdAt: now + 1,
    });

    // Re-render to pick up the entries
    const { user: user2 } = renderApp("/recent");

    expect(await screen.findByText("Oatmeal")).toBeInTheDocument();
    expect(screen.getByText("Chicken Salad")).toBeInTheDocument();
  });

  it("should re-add an entry from the recent list and navigate back", async () => {
    const { store } = renderApp();
    const now = Date.now();
    await store.addEntry({
      date: "2024-01-15",
      calories: 350,
      description: "Yogurt",
      createdAt: now,
    });

    // Navigate to recent page
    const { user } = renderApp("/recent");
    const addBtn = await screen.findByLabelText("Add Yogurt");
    await user.click(addBtn);

    // Should navigate back - we verify the entry was added
    const todayEntries = await store.getEntriesByDate(
      new Date().toISOString().split("T")[0],
    );
    const yogurtEntries = todayEntries.filter(
      (e) => e.description === "Yogurt",
    );
    expect(yogurtEntries).toHaveLength(1);
    expect(yogurtEntries[0].calories).toBe(350);
  });

  it("should filter entries by search", async () => {
    const { store } = renderApp();
    const now = Date.now();
    await store.addEntry({
      date: "2024-01-15",
      calories: 300,
      description: "Oatmeal",
      createdAt: now,
    });
    await store.addEntry({
      date: "2024-01-15",
      calories: 500,
      description: "Chicken Salad",
      createdAt: now + 1,
    });

    const { user } = renderApp("/recent");
    await screen.findByText("Oatmeal");

    const searchInput = screen.getByPlaceholderText("Search recent entries...");
    await user.type(searchInput, "oat");

    expect(screen.getByText("Oatmeal")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText("Chicken Salad")).not.toBeInTheDocument();
    });
  });

  it("should not show entries without descriptions", async () => {
    const { store } = renderApp();
    const now = Date.now();
    await store.addEntry({
      date: "2024-01-15",
      calories: 300,
      description: "Oatmeal",
      createdAt: now,
    });
    await store.addEntry({
      date: "2024-01-15",
      calories: 500,
      description: "",
      createdAt: now + 1,
    });

    renderApp("/recent");
    expect(await screen.findByText("Oatmeal")).toBeInTheDocument();
    expect(screen.getByText("300 cal")).toBeInTheDocument();
    // The empty description entry should not appear - only 1 entry shown
    expect(screen.queryByText("500 cal")).not.toBeInTheDocument();
  });
});
