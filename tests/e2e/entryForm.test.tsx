import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderApp } from "./helpers";

describe("EntryForm", () => {
  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory();
  });

  it("should add an entry and see it on the day view", async () => {
    const { user } = renderApp();

    const addButton = await screen.findByText("Log Calories");
    await user.click(addButton);

    const caloriesInput = screen.getByLabelText("Calories");
    await user.type(caloriesInput, "350");

    const descInput = screen.getByLabelText("Description (optional)");
    await user.type(descInput, "Veggie salad");

    const multiplierInput = screen.getByLabelText("Serving multiplier");
    await user.clear(multiplierInput);
    await user.type(multiplierInput, "2");

    await user.click(screen.getByText("Save"));

    expect(await screen.findByText("700 cal")).toBeInTheDocument();
    expect(screen.getByText("Veggie salad")).toBeInTheDocument();
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

  it("should show validation error for missing multiplier", async () => {
    const { user } = renderApp();

    await user.click(await screen.findByText("Log Calories"));
    await user.type(screen.getByLabelText("Calories"), "1");
    const multiplierInput = screen.getByLabelText("Serving multiplier");
    await user.clear(multiplierInput);
    await user.click(screen.getByText("Save"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Serving multiplier is required",
    );
  });

  it("should show validation error for negative serving multiplier", async () => {
    const { user } = renderApp();

    await user.click(await screen.findByText("Log Calories"));
    await user.type(screen.getByLabelText("Calories"), "1");
    const multiplierInput = screen.getByLabelText("Serving multiplier");
    await user.clear(multiplierInput);
    await user.type(multiplierInput, "-1.0");
    await user.click(screen.getByText("Save"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Serving multiplier must be a positive number",
    );
  });

  it("should show validation error for zero serving multiplier", async () => {
    const { user } = renderApp();

    await user.click(await screen.findByText("Log Calories"));
    await user.type(screen.getByLabelText("Calories"), "1");
    const multiplierInput = screen.getByLabelText("Serving multiplier");
    await user.clear(multiplierInput);
    await user.type(multiplierInput, "0");
    await user.click(screen.getByText("Save"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Serving multiplier must be a positive number",
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
