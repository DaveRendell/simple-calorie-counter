import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
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
});
