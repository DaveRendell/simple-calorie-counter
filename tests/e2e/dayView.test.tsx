import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { toDateStr } from "../../src/dateFormat";
import { renderApp } from "./helpers";

describe("DayView", () => {
  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory();
  });

  it("should show empty state on day view", async () => {
    renderApp();
    expect(await screen.findByText("No entries yet")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Log Calories")).toBeInTheDocument();
  });

  it("should show progress bar with default target", async () => {
    renderApp();
    expect(await screen.findByText(/\/ 2000 cal/)).toBeInTheDocument();
  });

  it("should navigate between days", async () => {
    const { user } = renderApp();
    await screen.findByText("Today");

    await user.click(screen.getByLabelText("Previous day"));
    expect(screen.queryByText("Today")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("Next day"));
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("should show calorie total and remaining", async () => {
    const { store } = renderApp("/settings");
    const today = toDateStr(new Date());
    const now = Date.now();

    await store.entries.add({
      date: today,
      calories: 500,
      description: "Lunch",
      createdAt: now,
    });

    renderApp("/");
    expect(await screen.findByText("500 cal")).toBeInTheDocument();
    expect(screen.getByText("1500 remaining")).toBeInTheDocument();
  });

  it("should show over-target state when calories exceed target", async () => {
    const { store } = renderApp("/settings");
    const today = toDateStr(new Date());
    const now = Date.now();

    await store.updateSettings({ dailyCalorieTarget: 500 });
    await store.entries.add({
      date: today,
      calories: 700,
      description: "Big meal",
      createdAt: now,
    });

    renderApp("/");
    expect(await screen.findByText("200 over")).toBeInTheDocument();
  });

  it("should show 'No description' for entries without a description", async () => {
    const { store } = renderApp("/settings");
    const today = toDateStr(new Date());

    await store.entries.add({
      date: today,
      calories: 300,
      description: "",
      createdAt: Date.now(),
    });

    renderApp("/");
    expect(await screen.findByText("300 cal")).toBeInTheDocument();
    expect(screen.getByText("No description")).toBeInTheDocument();
  });
});
