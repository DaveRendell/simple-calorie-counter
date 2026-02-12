import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { DataStoreProvider } from "../../src/hooks/useDataStore";
import { IndexedDBStore } from "../../src/store/IndexedDBStore";
import { Header } from "../../src/components/Header";
import { DayView } from "../../src/pages/DayView";
import { EntryForm } from "../../src/pages/EntryForm";
import { EditEntry } from "../../src/pages/EditEntry";
import { SettingsPage } from "../../src/pages/SettingsPage";
import { RecentEntries } from "../../src/pages/RecentEntries";
import { PlaceholderList } from "../../src/pages/PlaceholderList";
import { PlaceholderForm } from "../../src/pages/PlaceholderForm";
import { EditPlaceholder } from "../../src/pages/EditPlaceholder";
import "fake-indexeddb/auto";

export function renderApp(initialRoute = "/") {
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
            <Route path="/recent" element={<RecentEntries />} />
            <Route path="/placeholders" element={<PlaceholderList />} />
            <Route path="/placeholders/add" element={<PlaceholderForm />} />
            <Route
              path="/placeholders/edit/:id"
              element={<EditPlaceholder />}
            />
          </Routes>
        </MemoryRouter>
      </DataStoreProvider>,
    ),
  };
}
