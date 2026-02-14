import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { DataStoreProvider } from "./hooks/DataStoreProvider";
import { SettingsProvider } from "./hooks/SettingsProvider";
import { IndexedDBStore } from "./store";
import { useTheme } from "./hooks/useTheme";
import { Header } from "./components/Header";
import { DayView } from "./pages/DayView";
import { EntryForm } from "./pages/EntryForm";
import { EditEntry } from "./pages/EditEntry";
import { SettingsPage } from "./pages/SettingsPage";
import { RecentEntries } from "./pages/RecentEntries";
import { PlaceholderList } from "./pages/PlaceholderList";
import { PlaceholderForm } from "./pages/PlaceholderForm";
import { EditPlaceholder } from "./pages/EditPlaceholder";

const store = new IndexedDBStore();

function AppRoutes() {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="page-transition">
      <Header />
      <Routes>
        <Route path="/" element={<DayView />} />
        <Route path="/add" element={<EntryForm />} />
        <Route path="/edit/:id" element={<EditEntry />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/recent" element={<RecentEntries />} />
        <Route path="/placeholders" element={<PlaceholderList />} />
        <Route path="/placeholders/add" element={<PlaceholderForm />} />
        <Route path="/placeholders/edit/:id" element={<EditPlaceholder />} />
      </Routes>
    </div>
  );
}

function AppContent() {
  useTheme();
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <DataStoreProvider store={store}>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </DataStoreProvider>
  );
}
