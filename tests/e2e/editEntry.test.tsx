import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { toDateStr } from "../../src/dateFormat";
import { renderApp } from "./helpers";

describe("EditEntry", () => {
  beforeEach(() => {
    indexedDB = new IDBFactory();
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
