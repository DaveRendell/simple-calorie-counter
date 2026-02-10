import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataStoreProvider } from "./hooks/useDataStore";
import { IndexedDBStore } from "./store";
import { Header } from "./components/Header";
import { DayView } from "./pages/DayView";
import { EntryForm } from "./pages/EntryForm";
import { EditEntry } from "./pages/EditEntry";
import { SettingsPage } from "./pages/SettingsPage";

const store = new IndexedDBStore();

export default function App() {
  return (
    <DataStoreProvider store={store}>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<DayView />} />
          <Route path="/add" element={<EntryForm />} />
          <Route path="/edit/:id" element={<EditEntry />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </BrowserRouter>
    </DataStoreProvider>
  );
}
