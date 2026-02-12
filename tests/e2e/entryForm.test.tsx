import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderApp } from "./helpers";

describe("EntryForm", () => {
  beforeEach(() => {
    indexedDB = new IDBFactory();
  });

  it("should add an entry and see it on the day view", async () => {
    const { user } = renderApp();

    const addButton = await screen.findByText("Log Calories");
    await user.click(addButton);

    const caloriesInput = screen.getByLabelText("Calories");
    await user.type(caloriesInput, "350");

    const descInput = screen.getByLabelText("Description (optional)");
    await user.type(descInput, "Chicken salad");

    await user.click(screen.getByText("Save"));

    expect(await screen.findByText("350 cal")).toBeInTheDocument();
    expect(screen.getByText("Chicken salad")).toBeInTheDocument();
  });

  it("should show validation error when saving with empty calories", async () => {
    const { user } = renderApp();

    await user.click(await screen.findByText("Log Calories"));
    await user.click(screen.getByText("Save"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Calories is required",
    );
  });

  it("should show validation error for zero calories", async () => {
    const { user } = renderApp();

    await user.click(await screen.findByText("Log Calories"));
    await user.type(screen.getByLabelText("Calories"), "0");
    await user.click(screen.getByText("Save"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Calories must be a positive number",
    );
  });

  it("should show validation error for negative calories", async () => {
    const { user } = renderApp();

    await user.click(await screen.findByText("Log Calories"));
    await user.type(screen.getByLabelText("Calories"), "-100");
    await user.click(screen.getByText("Save"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Calories must be a positive number",
    );
  });

  it("should clear validation error when user starts typing", async () => {
    const { user } = renderApp();

    await user.click(await screen.findByText("Log Calories"));
    await user.click(screen.getByText("Save"));
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Calories"), "1");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
