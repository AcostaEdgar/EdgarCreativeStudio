"use client";
import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
const subscribe = (update: () => void) => {
  window.addEventListener("edgar-theme", update);
  const storage = (event: StorageEvent) => {
    if (
      event.key === "edgar-artist-theme" &&
      (event.newValue === "light" || event.newValue === "dark")
    ) {
      document.documentElement.dataset.theme = event.newValue;
      update();
    }
  };
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener("edgar-theme", update);
    window.removeEventListener("storage", storage);
  };
};
const snapshot = () => document.documentElement.dataset.theme || "light";
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, snapshot, () => "light");
  return (
    <button
      className="theme-toggle"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title="Change gallery lighting"
      onClick={() => {
        const next = theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem("edgar-artist-theme", next);
        } catch {}
        window.dispatchEvent(new Event("edgar-theme"));
      }}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      <span>{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
