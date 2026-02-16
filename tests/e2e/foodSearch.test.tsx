import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderApp } from "./helpers";
import type { FoodSearchResult } from "../../src/api/searchFoods";

const mockSearchFoods = vi.fn<(query: string) => Promise<FoodSearchResult[]>>();

vi.mock("../../src/api/searchFoods", () => ({
  searchFoods: (...args: Parameters<typeof mockSearchFoods>) =>
    mockSearchFoods(...args),
}));

const sampleResults: FoodSearchResult[] = [
  { name: "Banana - Chiquita", servingSize: "120g", calories: 105 },
  { name: "Apple - Granny Smith", servingSize: "182g", calories: 95 },
  { name: "Orange Juice - Tropicana", servingSize: "240ml", calories: 110 },
];

describe("FoodSearch", () => {
  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory();
    mockSearchFoods.mockReset();
  });

  it("should navigate to search page from DayView", async () => {
    const { user } = renderApp();
    await screen.findByText("Today");

    await user.click(screen.getByLabelText("Search foods"));
    expect(
      await screen.findByPlaceholderText("Search foods..."),
    ).toBeInTheDocument();
    expect(screen.getByText("Food Search")).toBeInTheDocument();
  });

  it("should search and display results", async () => {
    mockSearchFoods.mockResolvedValue(sampleResults);
    const { user } = renderApp("/search");

    const input = screen.getByPlaceholderText("Search foods...");
    await user.type(input, "banana");
    await user.click(screen.getByText("Search"));

    expect(mockSearchFoods).toHaveBeenCalledWith("banana");
    expect(await screen.findByText("Banana - Chiquita")).toBeInTheDocument();
    expect(screen.getByText("120g")).toBeInTheDocument();
    expect(screen.getByText("105 cal")).toBeInTheDocument();
    expect(screen.getByText("Apple - Granny Smith")).toBeInTheDocument();
    expect(screen.getByText("Orange Juice - Tropicana")).toBeInTheDocument();
  });

  it("should show no results message when search returns empty", async () => {
    mockSearchFoods.mockResolvedValue([]);
    const { user } = renderApp("/search");

    const input = screen.getByPlaceholderText("Search foods...");
    await user.type(input, "xyznonexistent");
    await user.click(screen.getByText("Search"));

    expect(await screen.findByText("No results found")).toBeInTheDocument();
  });

  it("should show error message when API fails", async () => {
    mockSearchFoods.mockRejectedValue(new Error("Network error"));
    const { user } = renderApp("/search");

    const input = screen.getByPlaceholderText("Search foods...");
    await user.type(input, "banana");
    await user.click(screen.getByText("Search"));

    expect(
      await screen.findByText("Failed to search. Please try again."),
    ).toBeInTheDocument();
  });

  it("should show loading state during search", async () => {
    let resolveSearch: (value: FoodSearchResult[]) => void;
    mockSearchFoods.mockReturnValue(
      new Promise((resolve) => {
        resolveSearch = resolve;
      }),
    );
    const { user } = renderApp("/search");

    const input = screen.getByPlaceholderText("Search foods...");
    await user.type(input, "banana");
    await user.click(screen.getByText("Search"));

    expect(await screen.findByText("Searching...")).toBeInTheDocument();

    resolveSearch!(sampleResults);
    expect(await screen.findByText("Banana - Chiquita")).toBeInTheDocument();
  });

  it("should navigate to add entry page with pre-populated data on selecting a result", async () => {
    mockSearchFoods.mockResolvedValue(sampleResults);
    const { user } = renderApp("/search");

    const input = screen.getByPlaceholderText("Search foods...");
    await user.type(input, "banana");
    await user.click(screen.getByText("Search"));

    await screen.findByText("Banana - Chiquita");
    await user.click(screen.getByText("Banana - Chiquita"));

    // Should navigate to add entry page with pre-populated fields
    const caloriesInput = await screen.findByLabelText("Calories");
    expect(caloriesInput).toHaveValue(105);

    const descriptionInput = screen.getByLabelText("Description (optional)");
    expect(descriptionInput).toHaveValue("Banana - Chiquita");
  });

  it("should preserve date when navigating from a non-today date", async () => {
    mockSearchFoods.mockResolvedValue([
      { name: "Test Food", servingSize: "100g", calories: 200 },
    ]);

    // Start on DayView and navigate to a past date
    const { user } = renderApp();
    await screen.findByText("Today");
    await user.click(screen.getByLabelText("Previous day"));

    // Navigate to search
    await user.click(screen.getByLabelText("Search foods"));
    await screen.findByPlaceholderText("Search foods...");

    // Search and select
    const input = screen.getByPlaceholderText("Search foods...");
    await user.type(input, "test");
    await user.click(screen.getByText("Search"));

    await screen.findByText("Test Food");
    await user.click(screen.getByText("Test Food"));

    // Should be on the add page with the calories pre-populated
    const caloriesInput = await screen.findByLabelText("Calories");
    expect(caloriesInput).toHaveValue(200);

    // Save the entry
    await user.click(screen.getByText("Save"));

    // Should navigate back to DayView showing the past date (not "Today")
    await waitFor(() => {
      expect(screen.queryByText("Today")).not.toBeInTheDocument();
    });
  });

  it("should not search with empty query", async () => {
    const { user } = renderApp("/search");

    await user.click(screen.getByText("Search"));

    expect(mockSearchFoods).not.toHaveBeenCalled();
  });

  it("should disable search button while loading", async () => {
    mockSearchFoods.mockReturnValue(new Promise(() => {}));
    const { user } = renderApp("/search");

    const input = screen.getByPlaceholderText("Search foods...");
    await user.type(input, "banana");
    await user.click(screen.getByText("Search"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "..." })).toBeDisabled();
    });
  });
});
