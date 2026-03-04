"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    // Read the current theme from the HTML attribute (set by the inline script)
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current || "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  // Don't render until hydrated to avoid mismatch
  if (!theme) return <div className="theme-toggle-placeholder" />;

  return (
    <button
      onClick={toggle}
      className="theme-toggle"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <span className={`theme-toggle-icon ${theme === "dark" ? "theme-icon-hidden" : ""}`}>
        <Sun size={16} strokeWidth={1.5} />
      </span>
      <span className={`theme-toggle-icon ${theme === "light" ? "theme-icon-hidden" : ""}`}>
        <Moon size={16} strokeWidth={1.5} />
      </span>
    </button>
  );
}
