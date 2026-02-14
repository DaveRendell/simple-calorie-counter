import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
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
});
