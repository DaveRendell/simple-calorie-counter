import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderApp } from "./helpers";

describe("Exercise entries", () => {
  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory();
  });

  it("should default to Food toggle on entry form", async () => {
    const { user } = renderApp();

    await user.click(await screen.findByText("Log Calories"));

    const foodBtn = screen.getByRole("radio", { name: "Food" });
    const exerciseBtn = screen.getByRole("radio", { name: "Exercise" });

    expect(foodBtn).toHaveAttribute("aria-checked", "true");
    expect(exerciseBtn).toHaveAttribute("aria-checked", "false");
  });

  it("should store negative calories when Exercise is selected", async () => {
    const { user, store } = renderApp();

    await user.click(await screen.findByText("Log Calories"));
    await user.click(screen.getByRole("radio", { name: "Exercise" }));
    await user.type(screen.getByLabelText("Calories"), "300");
    await user.type(
      screen.getByLabelText("Description (optional)"),
      "Morning run",
    );

    const multiplierInput = screen.getByLabelText("Serving multiplier");
    await user.clear(multiplierInput);
    await user.type(multiplierInput, "1");

    await user.click(screen.getByText("Save"));

    // Should show calories on day view (sign is in a separate element)
    expect(await screen.findByText("300 cal")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.getByText("Morning run")).toBeInTheDocument();

    // Verify stored as negative in DB
    const entries = await store.entries.getAll();
    expect(entries).toHaveLength(1);
    expect(entries[0].calories).toBe(-300);
  });

  it("should show exercise entry with exercise styling class", async () => {
    const { user } = renderApp();

    // Add an exercise entry
    await user.click(await screen.findByText("Log Calories"));
    await user.click(screen.getByRole("radio", { name: "Exercise" }));
    await user.type(screen.getByLabelText("Calories"), "200");
    await user.type(screen.getByLabelText("Description (optional)"), "Walk");

    const multiplierInput = screen.getByLabelText("Serving multiplier");
    await user.clear(multiplierInput);
    await user.type(multiplierInput, "1");

    await user.click(screen.getByText("Save"));

    // Wait for day view to show the entry
    await screen.findByText("200 cal");

    // Check the entry card has the exercise class
    const entryCard = screen.getByText("200 cal").closest(".entry-card");
    expect(entryCard).toHaveClass("entry-card--exercise");
  });

  it("should show Exercise toggle when editing an exercise entry", async () => {
    const { user } = renderApp();

    // Add an exercise entry
    await user.click(await screen.findByText("Log Calories"));
    await user.click(screen.getByRole("radio", { name: "Exercise" }));
    await user.type(screen.getByLabelText("Calories"), "500");
    await user.type(screen.getByLabelText("Description (optional)"), "Cycling");

    const multiplierInput = screen.getByLabelText("Serving multiplier");
    await user.clear(multiplierInput);
    await user.type(multiplierInput, "1");

    await user.click(screen.getByText("Save"));

    // Click the entry to edit it
    await user.click(await screen.findByText("500 cal"));

    // Exercise toggle should be selected
    const exerciseBtn = await screen.findByRole("radio", { name: "Exercise" });
    expect(exerciseBtn).toHaveAttribute("aria-checked", "true");

    // Calories should show as positive value
    const caloriesInput = screen.getByLabelText("Calories");
    expect(caloriesInput).toHaveValue(500);
  });

  it("should show Food toggle when editing a food entry", async () => {
    const { user } = renderApp();

    // Add a food entry
    await user.click(await screen.findByText("Log Calories"));
    await user.type(screen.getByLabelText("Calories"), "400");
    await user.type(screen.getByLabelText("Description (optional)"), "Lunch");

    const multiplierInput = screen.getByLabelText("Serving multiplier");
    await user.clear(multiplierInput);
    await user.type(multiplierInput, "1");

    await user.click(screen.getByText("Save"));

    // Click the entry to edit it
    await user.click(await screen.findByText("400 cal"));

    // Food toggle should be selected
    const foodBtn = await screen.findByRole("radio", { name: "Food" });
    expect(foodBtn).toHaveAttribute("aria-checked", "true");

    const caloriesInput = screen.getByLabelText("Calories");
    expect(caloriesInput).toHaveValue(400);
  });

  it("should subtract exercise calories from daily total", async () => {
    const { user } = renderApp();

    // Add a food entry (500 cal)
    await user.click(await screen.findByText("Log Calories"));
    await user.type(screen.getByLabelText("Calories"), "500");

    const multiplierInput = screen.getByLabelText("Serving multiplier");
    await user.clear(multiplierInput);
    await user.type(multiplierInput, "1");

    await user.click(screen.getByText("Save"));
    await screen.findByText("500 cal");

    // Add an exercise entry (200 cal)
    await user.click(await screen.findByText("Log Calories"));
    await user.click(screen.getByRole("radio", { name: "Exercise" }));
    await user.type(screen.getByLabelText("Calories"), "200");

    const multiplierInput2 = screen.getByLabelText("Serving multiplier");
    await user.clear(multiplierInput2);
    await user.type(multiplierInput2, "1");

    await user.click(screen.getByText("Save"));

    // Total should be 500 - 200 = 300
    await screen.findByText("200 cal");
    expect(screen.getByText("300")).toBeInTheDocument();
  });
});
