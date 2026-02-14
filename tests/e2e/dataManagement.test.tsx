import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderApp } from "./helpers";

describe("Data Management", () => {
  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory();
  });

  it("should export entries as CSV", async () => {
    const { user, store } = renderApp("/settings");
    await screen.findByText("Data Management");

    await store.entries.add({
      date: "2025-01-01",
      calories: 400,
      description: "Breakfast",
      createdAt: 1000,
    });
    await store.entries.add({
      date: "2025-01-01",
      calories: 600,
      description: "Lunch",
      createdAt: 2000,
    });

    let clickedUrl = "";
    const origCreateElement = document.createElement.bind(document);
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tag: string, options?: ElementCreationOptions) => {
        const el = origCreateElement(tag, options);
        if (tag === "a") {
          Object.defineProperty(el, "click", {
            value: () => {
              clickedUrl = (el as HTMLAnchorElement).href;
            },
          });
        }
        return el;
      });

    await user.click(
      screen.getByRole("button", { name: "Export Entries as CSV" }),
    );

    await waitFor(() =>
      expect(screen.getByText(/Exported 2 entries/)).toBeInTheDocument(),
    );

    expect(clickedUrl).toContain("blob:");
    createElementSpy.mockRestore();
  });

  it("should import entries, updating existing ones in place", async () => {
    const { user, store } = renderApp("/settings");
    await screen.findByText("Data Management");

    // Add one entry directly to the store
    const existing = await store.entries.add({
      date: "2025-01-01",
      calories: 400,
      description: "Breakfast",
      createdAt: 1000,
    });

    const csvContent = [
      "id,date,calories,description,createdAt,sortOrder,isFromPlaceholder",
      `${existing.id},2025-01-01,500,Breakfast edited,1000,0,`,
      `new-id-123,2025-01-02,600,Lunch,2000,1,`,
    ].join("\n");

    const file = new File([csvContent], "entries.csv", { type: "text/csv" });
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(input, file);

    await waitFor(() =>
      expect(
        screen.getByText(/Imported 1 new entries, updated 1 existing/),
      ).toBeInTheDocument(),
    );

    // Verify the existing entry was updated
    const updatedExisting = await store.entries.getById(existing.id);
    expect(updatedExisting!.description).toBe("Breakfast edited");
    expect(updatedExisting!.calories).toBe(500);

    // Verify the new entry was added
    const imported = await store.entries.getById("new-id-123");
    expect(imported).toBeDefined();
    expect(imported!.description).toBe("Lunch");
  });

  it("should import CSV with quoted descriptions containing commas", async () => {
    const { user, store } = renderApp("/settings");
    await screen.findByText("Data Management");

    const csvContent = [
      "id,date,calories,description,createdAt,sortOrder,isFromPlaceholder",
      `id-1,2025-01-01,500,"Eggs, bacon, toast",1000,0,`,
    ].join("\n");

    const file = new File([csvContent], "entries.csv", { type: "text/csv" });
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(input, file);

    await waitFor(() =>
      expect(screen.getByText(/Imported 1 new entries/)).toBeInTheDocument(),
    );

    const imported = await store.entries.getById("id-1");
    expect(imported).toBeDefined();
    expect(imported!.description).toBe("Eggs, bacon, toast");
  });

  it("should require 3 taps to clear all data", async () => {
    const { user, store } = renderApp("/settings");
    await screen.findByText("Data Management");

    await store.entries.add({
      date: "2025-01-01",
      calories: 400,
      description: "Breakfast",
      createdAt: 1000,
    });

    const clearBtn = screen.getByRole("button", { name: "Clear All Data" });

    // First tap
    await user.click(clearBtn);
    expect(
      screen.getByText("Tap 2 more times to clear all data."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tap 2 More to Confirm" }),
    ).toBeInTheDocument();

    // Second tap
    await user.click(
      screen.getByRole("button", { name: "Tap 2 More to Confirm" }),
    );
    expect(
      screen.getByText("Tap 1 more time to clear all data."),
    ).toBeInTheDocument();

    // Third tap — clears
    await user.click(
      screen.getByRole("button", { name: "Tap 1 More to Confirm" }),
    );

    await waitFor(() =>
      expect(screen.getByText("All data cleared.")).toBeInTheDocument(),
    );

    // Data should be gone
    const entries = await store.entries.getAll();
    expect(entries).toHaveLength(0);
  });
});
