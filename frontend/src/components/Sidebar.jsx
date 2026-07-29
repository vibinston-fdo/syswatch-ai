import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { LayoutDashboard, Activity, AlertTriangle, BarChart3, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import GlowingLogo from "./GlowingLogo";

const Sidebar = ({ alertCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [time, setTime] = useState(new Date());
  const [autoPilot, setAutoPilot] = useState(localStorage.getItem("autoPilot") === "true");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const sidebarWidth = isMobile ? "280px" : (collapsed ? "72px" : "240px");
  const sidebarX = isMobile ? (mobileOpen ? 0 : -300) : 0;

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <motion.button
          onClick={() => setMobileOpen(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 90,
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.3)",
            color: "#a78bfa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 0 15px rgba(124,58,237,0.2)"
          }}
        >
          <LayoutDashboard size={20} />
        </motion.button>
      )}

      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
            zIndex: 95
          }}
        />
      )}

      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: sidebarX, opacity: 1, width: sidebarWidth }}
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
        padding: "24px 16px 32px 16px",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Header / Logo */}
      <div style={{ 
        display: "flex", 
        flexDirection: collapsed ? "column" : "row",
        alignItems: "center", 
        justifyContent: collapsed ? "center" : "space-between", 
        marginBottom: "40px", 
        padding: collapsed ? "0" : "0 4px",
        gap: collapsed ? "24px" : "0"
      }}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer", marginLeft: collapsed ? "0px" : "8px" }}
        >
          {collapsed ? (
            <div style={{ transform: "scale(0.8)", transformOrigin: "center", display: "flex", justifyContent: "center" }}>
              <GlowingLogo size="small" showText={false} />
            </div>
          ) : (
            <GlowingLogo size="small" showText={true} />
          )}
        </motion.div>

        {/* Collapse toggle (Desktop only) */}
        {!isMobile && (
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(124,58,237,0.15)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              width: "28px", height: "28px", borderRadius: "8px",
              background: "rgba(255,255,255,0.03)", 
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#a78bfa", cursor: "pointer", flexShrink: 0
            }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </motion.button>
        )}
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
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
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
              <div style={{ position: "relative" }}>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.label === "Alerts" && alertCount > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-4px", right: "-4px",
                      width: "14px", height: "14px",
                      background: "#ef4444",
                      color: "#fff", fontSize: "9px",
                      borderRadius: "50%", fontWeight: "800",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 0 10px rgba(239,68,68,0.5)"
                    }}
                  >
                    {alertCount}
                  </div>
                )}
              </div>
              {!collapsed && <span>{item.label}</span>}

            </motion.button>
          );
        })}
      </div>

      {/* Footer / Status */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "auto", paddingTop: "24px" }}>
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
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-end", gap: "8px" }}>
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

      </div>
    </motion.aside>
    </>
  );
};

export default Sidebar;
