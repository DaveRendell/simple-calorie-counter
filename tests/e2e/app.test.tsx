import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { DataStoreProvider } from "../../src/hooks/useDataStore";
import { IndexedDBStore } from "../../src/store/IndexedDBStore";
import { Header } from "../../src/components/Header";
import { DayView } from "../../src/pages/DayView";
import { EntryForm } from "../../src/pages/EntryForm";
import { EditEntry } from "../../src/pages/EditEntry";
import { SettingsPage } from "../../src/pages/SettingsPage";
import "fake-indexeddb/auto";

function renderApp(initialRoute = "/") {
  const store = new IndexedDBStore();

  return {
    store,
    user: userEvent.setup(),
    ...render(
      <DataStoreProvider store={store}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Header />
          <Routes>
            <Route path="/" element={<DayView />} />
            <Route path="/add" element={<EntryForm />} />
            <Route path="/edit/:id" element={<EditEntry />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </MemoryRouter>
      </DataStoreProvider>,
    ),
  };
}

describe("App integration tests", () => {
  beforeEach(() => {
    indexedDB = new IDBFactory();
  });

  it("should show empty state on day view", async () => {
    renderApp();
    expect(await screen.findByText("No entries yet")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("+ Add Entry")).toBeInTheDocument();
  });

  it("should show progress bar with default target", async () => {
    renderApp();
    expect(await screen.findByText(/\/ 2000 cal/)).toBeInTheDocument();
  });

  it("should add an entry and see it on the day view", async () => {
    const { user } = renderApp();

    // Click add entry
    const addButton = await screen.findByText("+ Add Entry");
    await user.click(addButton);

    // Fill in the form
    const caloriesInput = screen.getByLabelText("Calories");
    await user.type(caloriesInput, "350");

    const descInput = screen.getByLabelText("Description (optional)");
    await user.type(descInput, "Chicken salad");

    // Save
    await user.click(screen.getByText("Save"));

    // Should be back on day view with the entry
    expect(await screen.findByText("350 cal")).toBeInTheDocument();
    expect(screen.getByText("Chicken salad")).toBeInTheDocument();
  });

  it("should navigate between days", async () => {
    const { user } = renderApp();
    await screen.findByText("Today");

    // Navigate to previous day
    await user.click(screen.getByLabelText("Previous day"));
    expect(screen.queryByText("Today")).not.toBeInTheDocument();

    // Navigate forward
    await user.click(screen.getByLabelText("Next day"));
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("should edit an entry", async () => {
    const { user, store } = renderApp();
    const today = new Date().toISOString().split("T")[0];

    // Add entry directly via store
    await store.addEntry({
      date: today,
      calories: 200,
      description: "Snack",
      createdAt: Date.now(),
    });

    // Refresh the view by navigating away and back
    await user.click(screen.getByLabelText("Previous day"));
    await user.click(screen.getByLabelText("Next day"));

    // Click on the entry
    const entryCard = await screen.findByText("200 cal");
    await user.click(entryCard);

    // Should be on edit page
    const caloriesInput = await screen.findByLabelText("Calories");
    expect(caloriesInput).toHaveValue(200);

    // Update the calories
    await user.clear(caloriesInput);
    await user.type(caloriesInput, "250");
    await user.click(screen.getByText("Save"));

    // Back on day view with updated entry
    expect(await screen.findByText("250 cal")).toBeInTheDocument();
  });

  it("should delete an entry with confirmation", async () => {
    const { user, store } = renderApp();
    const today = new Date().toISOString().split("T")[0];

    await store.addEntry({
      date: today,
      calories: 400,
      description: "Dinner",
      createdAt: Date.now(),
    });

    // Refresh
    await user.click(screen.getByLabelText("Previous day"));
    await user.click(screen.getByLabelText("Next day"));

    // Click entry
    const entryCard = await screen.findByText("400 cal");
    await user.click(entryCard);

    // Click delete first time - should ask for confirmation
    const deleteBtn = await screen.findByText("Delete");
    await user.click(deleteBtn);
    expect(screen.getByText("Tap again to confirm")).toBeInTheDocument();

    // Click again to confirm
    await user.click(screen.getByText("Tap again to confirm"));

    // Back on day view, entry should be gone
    expect(await screen.findByText("No entries yet")).toBeInTheDocument();
  });

  it("should update calorie target in settings", async () => {
    const { user } = renderApp();

    // Navigate to settings from home
    await screen.findByText("Today");
    await user.click(screen.getByLabelText("Settings"));

    const input = await screen.findByLabelText("Daily Calorie Target");
    expect(input).toHaveValue(2000);

    await user.clear(input);
    await user.type(input, "1500");
    // Trigger blur to save
    await user.tab();

    // Navigate back to day view
    await user.click(screen.getByText("←"));

    // Check the progress bar reflects new target
    expect(await screen.findByText(/\/ 1500 cal/)).toBeInTheDocument();
  });
});
