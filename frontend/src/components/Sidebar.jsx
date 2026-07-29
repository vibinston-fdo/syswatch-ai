import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import { LayoutDashboard, Activity, AlertTriangle, BarChart3, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

const Sidebar = ({ alertCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [time, setTime] = useState(new Date());
  const [autoPilot, setAutoPilot] = useState(localStorage.getItem("autoPilot") === "true");

  const toggleAutoPilot = () => {
    const newState = !autoPilot;
    setAutoPilot(newState);
    localStorage.setItem("autoPilot", newState);
    // Dispatch an event so other components know immediately
    window.dispatchEvent(new Event("autoPilotChanged"));
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Services", path: "/services", icon: Activity },
    { label: "Alerts", path: "/alerts", icon: AlertTriangle },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const sidebarWidth = collapsed ? "72px" : "240px";

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1, width: sidebarWidth }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      style={{
        height: "100vh",
        background: "rgba(3,3,8,0.85)",
        backdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "24px 16px",
      }}
    >
      {/* Header / Logo */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", marginBottom: "40px", padding: collapsed ? "0" : "0 8px" }}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/dashboard")}
          style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
        >
          <motion.div
            animate={{ boxShadow: ["0 0 16px rgba(124,58,237,0.35)", "0 0 28px rgba(124,58,237,0.6)", "0 0 16px rgba(124,58,237,0.35)"] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: "28px", height: "28px", borderRadius: "7px",
              background: "linear-gradient(135deg, #7c3aed, #6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0
            }}
          >
            <div style={{ width: "11px", height: "11px", borderRadius: "2px", border: "2px solid rgba(255,255,255,0.85)" }} />
          </motion.div>
          {!collapsed && (
            <span style={{ fontSize: "16px", fontWeight: "700", color: "#f8fafc", letterSpacing: "-0.5px" }}>
              SysWatch <span className="gradient-text">AI</span>
            </span>
          )}
        </motion.div>
      </div>

      {/* Nav Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        <div style={{ fontSize: "10px", fontWeight: "600", color: "#475569", letterSpacing: "1px", marginBottom: "8px", paddingLeft: collapsed ? "0" : "8px", textAlign: collapsed ? "center" : "left" }}>
          {!collapsed ? "PLATFORM" : "..."}
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.path}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.03)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
                gap: "12px", padding: "10px", borderRadius: "10px", border: "1px solid transparent",
                background: isActive ? "rgba(124,58,237,0.12)" : "transparent",
                borderColor: isActive ? "rgba(124,58,237,0.2)" : "transparent",
                color: isActive ? "#a78bfa" : "#64748b",
                fontSize: "13px", fontWeight: isActive ? "600" : "500",
                cursor: "pointer", transition: "all 0.2s",
                position: "relative"
              }}
              title={collapsed ? item.label : ""}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {!collapsed && <span>{item.label}</span>}
              {item.label === "Alerts" && alertCount > 0 && (
                <div
                  style={{
                    position: collapsed ? "absolute" : "relative",
                    top: collapsed ? "4px" : "auto", right: collapsed ? "4px" : "auto",
                    marginLeft: collapsed ? "0" : "auto",
                    background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                    color: "#f87171", fontSize: "10px", padding: "2px 6px",
                    borderRadius: "10px", fontWeight: "700"
                  }}
                >
                  {alertCount}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Footer / Status */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "auto" }}>
        {!collapsed && (
          <div style={{ padding: "12px", background: "rgba(34,197,94,0.06)", borderRadius: "12px", border: "1px solid rgba(34,197,94,0.15)", display: "flex", alignItems: "center", gap: "10px" }}>
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", flexShrink: 0 }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "11px", color: "#4ade80", fontWeight: "600", letterSpacing: "0.5px" }}>SYSTEM LIVE</span>
              <span style={{ fontSize: "10px", color: "#64748b", fontFamily: "monospace" }}>{time.toLocaleTimeString()}</span>
            </div>
          </div>
        )}
        
        {!collapsed && (
          <div style={{ padding: "12px", background: "rgba(14,165,233,0.06)", borderRadius: "12px", border: "1px solid rgba(14,165,233,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "11px", color: "#0ea5e9", fontWeight: "600", letterSpacing: "0.5px" }}>AUTO-PILOT</span>
              <span style={{ fontSize: "9px", color: "#94a3b8" }}>AI Remediation</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={autoPilot} onChange={toggleAutoPilot} />
              <span className="slider"></span>
            </label>
          </div>
        )}
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", gap: "8px" }}>
           {!collapsed && <ThemeSwitcher />}
           <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            title="Logout"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "36px", height: "36px", borderRadius: "10px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
              color: "#94a3b8", cursor: "pointer"
            }}
          >
            <LogOut size={16} />
          </motion.button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: "absolute", right: "-12px", top: "40px",
            width: "24px", height: "24px", borderRadius: "50%",
            background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#94a3b8", cursor: "pointer", zIndex: 10
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
