import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { toDateStr } from "../../src/dateFormat";
import { renderApp } from "./helpers";

describe("EditEntry", () => {
  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory();
  });

  it("should edit an entry", async () => {
    const { user, store } = renderApp();
    const today = toDateStr(new Date());

    await store.entries.add({
      date: today,
      calories: 200,
      description: "Snack",
      createdAt: Date.now(),
    });

    // Refresh the view by navigating away and back
    await user.click(screen.getByLabelText("Previous day"));
    await user.click(screen.getByLabelText("Next day"));

    const entryCard = await screen.findByText("200 cal");
    await user.click(entryCard);

    const caloriesInput = await screen.findByLabelText("Calories");
    expect(caloriesInput).toHaveValue(200);

    await user.clear(caloriesInput);
    await user.type(caloriesInput, "250");
    await user.click(screen.getByText("Save"));

    expect(await screen.findByText("250 cal")).toBeInTheDocument();
  });

  it("should delete an entry with confirmation", async () => {
    const { user, store } = renderApp();
    const today = toDateStr(new Date());

    await store.entries.add({
      date: today,
      calories: 400,
      description: "Dinner",
      createdAt: Date.now(),
    });

    // Refresh
    await user.click(screen.getByLabelText("Previous day"));
    await user.click(screen.getByLabelText("Next day"));

    const entryCard = await screen.findByText("400 cal");
    await user.click(entryCard);

    const deleteBtn = await screen.findByText("Delete");
    await user.click(deleteBtn);
    expect(screen.getByText("Tap again to confirm")).toBeInTheDocument();

    await user.click(screen.getByText("Tap again to confirm"));

    expect(await screen.findByText("No entries yet")).toBeInTheDocument();
  });

  it("should edit the description of an entry", async () => {
    const { user, store } = renderApp();
    const today = toDateStr(new Date());

    await store.entries.add({
      date: today,
      calories: 300,
      description: "Oatmeal",
      createdAt: Date.now(),
    });

    await user.click(screen.getByLabelText("Previous day"));
    await user.click(screen.getByLabelText("Next day"));

    await user.click(await screen.findByText("Oatmeal"));

    const descInput = await screen.findByLabelText("Description (optional)");
    await user.clear(descInput);
    await user.type(descInput, "Porridge");
    await user.click(screen.getByText("Save"));

    expect(await screen.findByText("Porridge")).toBeInTheDocument();
  });

  it("should return to the same date after editing an entry on a non-today date", async () => {
    const { user, store } = renderApp();
    const yesterday = toDateStr(
      new Date(new Date().setDate(new Date().getDate() - 1)),
    );

    await store.entries.add({
      date: yesterday,
      calories: 300,
      description: "Old entry",
      createdAt: Date.now(),
    });

    // Navigate to previous day
    await user.click(screen.getByLabelText("Previous day"));

    // Remember the displayed date
    const dateLabelEl = document.querySelector(".date-label")!;
    const previousDayText = dateLabelEl.textContent!;
    expect(previousDayText).not.toBe("Today");

    // Click the entry to edit it
    const entryCard = await screen.findByText("300 cal");
    await user.click(entryCard);

    // Edit calories
    const caloriesInput = await screen.findByLabelText("Calories");
    await user.clear(caloriesInput);
    await user.type(caloriesInput, "350");
    await user.click(screen.getByText("Save"));

    // Should be back on the previous day, not today
    expect(await screen.findByText("350 cal")).toBeInTheDocument();
    expect(screen.queryByText("Today")).not.toBeInTheDocument();
    expect(document.querySelector(".date-label")!.textContent).toBe(
      previousDayText,
    );
  });

  it("should show validation error when clearing calories and saving", async () => {
    const { user, store } = renderApp();
    const today = toDateStr(new Date());

    await store.entries.add({
      date: today,
      calories: 200,
      description: "Snack",
      createdAt: Date.now(),
    });

    await user.click(screen.getByLabelText("Previous day"));
    await user.click(screen.getByLabelText("Next day"));

    await user.click(await screen.findByText("200 cal"));

    const caloriesInput = await screen.findByLabelText("Calories");
    await user.clear(caloriesInput);
    await user.click(screen.getByText("Save"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Calories is required",
    );
  });
});
