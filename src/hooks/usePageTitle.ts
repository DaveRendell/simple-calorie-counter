import { useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  "/": "Calories",
  "/add": "Add Entry",
  "/settings": "Settings",
  "/recent": "Recent Entries",
  "/placeholders": "Placeholders",
  "/placeholders/add": "Add Placeholder",
};

export function usePageTitle(): string {
  const { pathname } = useLocation();

  if (titles[pathname]) return titles[pathname];
  if (pathname.startsWith("/placeholders/edit/")) return "Edit Placeholder";
  if (pathname.startsWith("/edit/")) return "Edit Entry";

  return "Calories";
}
