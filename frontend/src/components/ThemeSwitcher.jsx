import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTheme, themes } from "../context/ThemeContext";

const ThemeSwitcher = () => {
  const { currentTheme, setCurrentTheme, theme } = useTheme();
  const [open, setOpen] = useState(false);

  const themeColors = {
    purple:  "#7c3aed",
    cyan:    "#06b6d4",
    emerald: "#10b981",
    orange:  "#f97316",
    rose:    "#f43f5e",
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Toggle button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        style={{
          width: "32px", height: "32px",
          borderRadius: "8px",
          background: theme.gradient,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 12px ${theme.glow}`,
          fontSize: "14px",
        }}
      >🎨</motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            style={{
              position: "absolute",
              top: "40px",
              right: 0,
              background: "rgba(8,8,18,0.95)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "12px",
              backdropFilter: "blur(20px)",
              zIndex: 999,
              minWidth: "160px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{
              fontSize: "10px", color: "#334155",
              letterSpacing: "1px", marginBottom: "10px",
              fontFamily: "Inter, sans-serif",
            }}>THEME</div>

            {Object.entries(themeColors).map(([name, color]) => (
              <motion.button
                key={name}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setCurrentTheme(name); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "8px 10px",
                  background: currentTheme === name
                    ? `${color}15`
                    : "transparent",
                  border: currentTheme === name
                    ? `1px solid ${color}30`
                    : "1px solid transparent",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginBottom: "4px",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <div style={{
                  width: "16px", height: "16px",
                  borderRadius: "50%",
                  background: color,
                  boxShadow: `0 0 8px ${color}`,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: "12px",
                  color: currentTheme === name ? color : "#475569",
                  fontWeight: currentTheme === name ? "600" : "400",
                  textTransform: "capitalize",
                }}>
                  {themes[name].name}
                </span>
                {currentTheme === name && (
                  <span style={{
                    marginLeft: "auto",
                    fontSize: "10px",
                    color: color,
                  }}>✓</span>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;