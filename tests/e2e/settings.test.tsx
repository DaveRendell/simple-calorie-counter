import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderApp } from "./helpers";

describe("Settings", () => {
  beforeEach(() => {
    indexedDB = new IDBFactory();
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
});
