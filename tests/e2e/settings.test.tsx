import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { toDateStr } from "../../src/dateFormat";
import { renderApp } from "./helpers";

describe("Settings", () => {
  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory();
  });

  it("should update calorie target in settings", async () => {
    const { user } = renderApp();

    await screen.findByText("Today");
    await user.click(screen.getByLabelText("Settings"));

    const input = await screen.findByLabelText("Daily Calorie Target");
    await vi.waitFor(() => expect(input).toHaveValue(2000));

    await user.clear(input);
    await user.type(input, "1500");
    await user.tab();

    await user.click(screen.getByLabelText("Back"));

    expect(await screen.findByText(/\/ 1500 cal/)).toBeInTheDocument();
  });

  it("should show theme toggle with System selected by default", async () => {
    renderApp("/settings");

    const systemBtn = await screen.findByRole("radio", { name: "System" });
    expect(systemBtn).toHaveAttribute("aria-checked", "true");

    const lightBtn = screen.getByRole("radio", { name: "Light" });
    expect(lightBtn).toHaveAttribute("aria-checked", "false");

    const darkBtn = screen.getByRole("radio", { name: "Dark" });
    expect(darkBtn).toHaveAttribute("aria-checked", "false");
  });

  it("should switch theme when clicking a toggle option", async () => {
    const { user } = renderApp("/settings");

    const darkBtn = await screen.findByRole("radio", { name: "Dark" });
    await user.click(darkBtn);

    expect(darkBtn).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "System" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("should update calorieGoal on today's entries when changing target", async () => {
    const { user, store } = renderApp();
    const today = toDateStr(new Date());

    // Add an entry for today with default goal
    await store.entries.add({
      date: today,
      calories: 500,
      description: "Lunch",
      createdAt: Date.now(),
      calorieGoal: 2000,
    });

    await screen.findByText("Today");
    await user.click(screen.getByLabelText("Settings"));

    const input = await screen.findByLabelText("Daily Calorie Target");
    await vi.waitFor(() => expect(input).toHaveValue(2000));

    await user.clear(input);
    await user.type(input, "1500");
    await user.tab();

    // Verify the entry's calorieGoal was updated (async propagation)
    await vi.waitFor(async () => {
      const entries = await store.entries.getByDate(today);
      expect(entries[0].calorieGoal).toBe(1500);
    });
  });

  it("should not update calorieGoal on past entries when changing target", async () => {
    const { user, store } = renderApp();
    const yesterday = toDateStr(new Date(Date.now() - 86400000));

    await store.entries.add({
      date: yesterday,
      calories: 500,
      description: "Past lunch",
      createdAt: Date.now() - 86400000,
      calorieGoal: 2000,
    });

    await screen.findByText("Today");
    await user.click(screen.getByLabelText("Settings"));

    const input = await screen.findByLabelText("Daily Calorie Target");
    await vi.waitFor(() => expect(input).toHaveValue(2000));

    await user.clear(input);
    await user.type(input, "1500");
    await user.tab();

    // Wait for async propagation, then verify past entry is unchanged
    await vi.waitFor(async () => {
      const settings = await store.getSettings();
      expect(settings.dailyCalorieTarget).toBe(1500);
    });
    const entries = await store.entries.getByDate(yesterday);
    expect(entries[0].calorieGoal).toBe(2000);
  });
});
