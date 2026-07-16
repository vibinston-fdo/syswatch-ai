import { createContext, useContext, useState } from "react";

// Define all themes
export const themes = {
  purple: {
    name: "Purple",
    primary: "#7c3aed",
    secondary: "#6366f1",
    accent: "#a78bfa",
    glow: "rgba(124,58,237,0.3)",
    gradient: "linear-gradient(135deg, #7c3aed, #6366f1)",
    badge: "rgba(124,58,237,0.1)",
    border: "rgba(124,58,237,0.2)",
  },
  cyan: {
    name: "Cyan",
    primary: "#0891b2",
    secondary: "#06b6d4",
    accent: "#67e8f9",
    glow: "rgba(6,182,212,0.3)",
    gradient: "linear-gradient(135deg, #0891b2, #06b6d4)",
    badge: "rgba(6,182,212,0.1)",
    border: "rgba(6,182,212,0.2)",
  },
  emerald: {
    name: "Emerald",
    primary: "#059669",
    secondary: "#10b981",
    accent: "#6ee7b7",
    glow: "rgba(16,185,129,0.3)",
    gradient: "linear-gradient(135deg, #059669, #10b981)",
    badge: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.2)",
  },
  orange: {
    name: "Orange",
    primary: "#ea580c",
    secondary: "#f97316",
    accent: "#fdba74",
    glow: "rgba(249,115,22,0.3)",
    gradient: "linear-gradient(135deg, #ea580c, #f97316)",
    badge: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.2)",
  },
  rose: {
    name: "Rose",
    primary: "#e11d48",
    secondary: "#f43f5e",
    accent: "#fda4af",
    glow: "rgba(244,63,94,0.3)",
    gradient: "linear-gradient(135deg, #e11d48, #f43f5e)",
    badge: "rgba(244,63,94,0.1)",
    border: "rgba(244,63,94,0.2)",
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState("purple");

  const theme = themes[currentTheme];

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, setCurrentTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);