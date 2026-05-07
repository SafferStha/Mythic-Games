import React, { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

// Standalone hook that works without ThemeProvider
export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved;
      if (window.matchMedia("(prefers-color-scheme: light)").matches)
        return "light";
    } catch (e) {}
    return "dark";
  });

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  return { theme, toggleTheme };
};

export const ThemeProvider = ({ children }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};