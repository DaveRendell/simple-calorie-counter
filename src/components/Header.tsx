import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import { LEFT, SETTINGS } from "../icons";
import { usePageTitle } from "../hooks/usePageTitle";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const title = usePageTitle();

  return (
    <header className="header">
      {!isHome ? (
        <button
          className="header-back"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          {LEFT}
        </button>
      ) : (
        <div className="header-spacer" />
      )}
      <h1 className="header-title">{title}</h1>
      {isHome ? (
        <button
          className="header-settings"
          onClick={() => navigate("/settings")}
          aria-label="Settings"
        >
          {SETTINGS}
        </button>
      ) : (
        <div className="header-spacer" />
      )}
    </header>
  );
}
