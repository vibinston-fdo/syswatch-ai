import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const Navbar = ({ alertCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: "⬡" },
    { label: "Services", path: "/services", icon: "◈" },
    { label: "Alerts", path: "/alerts", icon: "◎" },
    { label: "Analytics", path: "/analytics", icon: "◇" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        height: "56px",
        background: scrolled
          ? "rgba(3,3,8,0.95)"
          : "rgba(3,3,8,0.7)",
        backdropFilter: "blur(24px)",
        borderBottom: scrolled
          ? "1px solid rgba(124,58,237,0.2)"
          : "1px solid rgba(255,255,255,0.04)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        fontFamily: "'Inter', system-ui, sans-serif",
        transition: "all 0.3s ease",
        boxShadow: scrolled
          ? "0 4px 30px rgba(0,0,0,0.3)"
          : "none",
      }}
    >
      {/* Logo */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
        }}
        onClick={() => navigate("/dashboard")}
      >
        <motion.div
          animate={{ boxShadow: ["0 0 16px rgba(124,58,237,0.35)", "0 0 28px rgba(124,58,237,0.6)", "0 0 16px rgba(124,58,237,0.35)"] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "7px",
            background: "linear-gradient(135deg, #7c3aed, #6366f1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{
            width: "11px",
            height: "11px",
            borderRadius: "2px",
            border: "2px solid rgba(255,255,255,0.85)",
          }} />
        </motion.div>
        <span style={{
          fontSize: "14px",
          fontWeight: "700",
          color: "#f8fafc",
          letterSpacing: "-0.3px",
        }}>SysWatch <span className="gradient-text">AI</span></span>
      </motion.div>

      {/* Nav items */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "2px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.04)",
        borderRadius: "12px",
        padding: "4px",
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.button
              key={item.path}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                background: isActive
                  ? "rgba(124,58,237,0.15)"
                  : "transparent",
                color: isActive ? "#a78bfa" : "#334155",
                fontSize: "13px",
                fontWeight: isActive ? "600" : "400",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit",
                letterSpacing: "0.1px",
                position: "relative",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(124,58,237,0.12)",
                    borderRadius: "8px",
                    border: "1px solid rgba(124,58,237,0.25)",
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span style={{ fontSize: "12px", position: "relative" }}>{item.icon}</span>
              <span style={{ position: "relative" }}>{item.label}</span>
              {item.label === "Alerts" && alertCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#f87171",
                    fontSize: "10px",
                    padding: "1px 6px",
                    borderRadius: "100px",
                    fontWeight: "700",
                    position: "relative",
                  }}
                >{alertCount}</motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

        {/* Live clock */}
        <div style={{
          fontSize: "11px",
          color: "#1e293b",
          fontFamily: "monospace",
          letterSpacing: "0.5px",
        }}>
          {time.toLocaleTimeString()}
        </div>

        {/* Live indicator */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 12px",
            borderRadius: "100px",
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.15)",
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.4, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 6px #22c55e",
            }}
          />
          <span style={{
            fontSize: "11px",
            color: "#4ade80",
            fontWeight: "500",
            letterSpacing: "0.5px",
          }}>LIVE</span>
        </motion.div>

        {/* User avatar */}
        <motion.div
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 20px rgba(124,58,237,0.5)"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          title="Click to logout"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #38bdf8)",
            boxShadow: "0 0 12px rgba(124,58,237,0.3)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "700",
            color: "#fff",
            border: "2px solid rgba(255,255,255,0.1)",
          }}
        >
          V
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;