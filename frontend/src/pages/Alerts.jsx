import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import Sidebar from "../components/Sidebar";
import { ShieldAlert, ShieldCheck, RefreshCw, Wand2 } from "lucide-react";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [fixModal, setFixModal] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await api.get("/api/alerts");
      if (Array.isArray(res.data)) setAlerts(res.data);
      else setAlerts([]);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleResolve = async (alertId) => {
    try {
      await api.put(`/api/alerts/resolve/${alertId}`);
      fetchAlerts();
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = alerts.filter(a => {
    if (filter === "active") return !a.resolved;
    if (filter === "resolved") return a.resolved;
    return true;
  });

  const severityConfig = {
    critical: { color: "#f87171", glow: "rgba(248,113,113,0.2)", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", icon: ShieldAlert },
    warning:  { color: "#fbbf24", glow: "rgba(251,191,36,0.2)",  bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)",  icon: ShieldAlert },
  };

  const timeAgo = (timestamp) => {
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`, backgroundSize: "64px 64px", pointerEvents: "none", zIndex: 0 }} />

      <Sidebar alertCount={alerts.filter(a => !a.resolved).length} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ position: "relative", zIndex: 1, padding: "32px 40px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", letterSpacing: "1px" }}>PLATFORM / </span>
            <span style={{ fontSize: "12px", color: "#f8fafc", fontWeight: "600", letterSpacing: "1px" }}>ALERTS</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: "700", letterSpacing: "-1px", margin: "0 0 8px", color: "#f8fafc" }}>Alerts</h1>
              <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>AI-detected anomalies across all services</p>
            </div>
            {alerts.filter(a => !a.resolved).length > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "100px" }}>
                <motion.div animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f87171", boxShadow: "0 0 8px #f87171" }} />
                <span style={{ fontSize: "12px", color: "#f87171", fontWeight: "600" }}>{alerts.filter(a => !a.resolved).length} active</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "TOTAL ALERTS", value: alerts.length, color: "#818cf8" },
            { label: "ACTIVE", value: alerts.filter(a => !a.resolved).length, color: "#f87171" },
            { label: "RESOLVED", value: alerts.filter(a => a.resolved).length, color: "#4ade80" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="glass-panel" style={{ padding: "20px 24px" }}>
              <div style={{ fontSize: "11px", color: "#64748b", letterSpacing: "1px", marginBottom: "8px" }}>{stat.label}</div>
              <div className="font-mono" style={{ fontSize: "32px", fontWeight: "700", color: stat.color }}>{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
          {["all", "active", "resolved"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 18px", borderRadius: "8px",
              background: filter === f ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)",
              border: filter === f ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(255,255,255,0.06)",
              color: filter === f ? "#a78bfa" : "#64748b",
              fontSize: "12px", fontWeight: "500", cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.2s", textTransform: "capitalize",
            }}>{f}</button>
          ))}
        </div>

        {/* Alerts List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {loading ? (
            <div className="font-mono" style={{ textAlign: "center", padding: "60px", color: "#64748b", fontSize: "12px" }}>Scanning for anomalies...</div>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel" style={{ textAlign: "center", padding: "80px" }}>
              <ShieldCheck size={40} color="#4ade80" style={{ margin: "0 auto 16px" }} />
              <div style={{ fontSize: "14px", color: "#4ade80", fontWeight: "500", marginBottom: "6px" }}>All clear!</div>
              <div className="font-mono" style={{ fontSize: "12px", color: "#64748b" }}>No {filter !== "all" ? filter : ""} alerts detected</div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filtered.map((alert, i) => {
                const s = alert.resolved
                  ? { color: "#4ade80", glow: "rgba(74,222,128,0.2)", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", icon: ShieldCheck }
                  : severityConfig[alert.severity] || severityConfig.warning;
                const Icon = s.icon;
                return (
                  <motion.div key={alert.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ delay: i * 0.04 }}
                    className="glass-panel" style={{ padding: "20px 24px", border: `1px solid ${s.border}`, display: "flex", gap: "16px", position: "relative", overflow: "hidden" }}>
                    
                    {/* Left accent */}
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: s.color, boxShadow: `0 0 10px ${s.glow}`, borderRadius: "16px 0 0 16px" }} />

                    <div style={{ paddingLeft: "8px", flexShrink: 0, marginTop: "2px" }}>
                      <Icon size={20} color={s.color} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#f1f5f9" }}>{alert.alert_type}</span>
                        <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "100px", background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontWeight: "600" }}>
                          {alert.resolved ? "RESOLVED" : alert.severity?.toUpperCase()}
                        </span>
                        <span className="font-mono" style={{ fontSize: "11px", color: "#64748b", padding: "3px 10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "100px" }}>
                          {alert.service_name}
                        </span>
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px", lineHeight: "1.6" }}>{alert.description}</div>

                      {!alert.resolved && (
                        <>
                          <div style={{ marginBottom: "14px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                              <span style={{ fontSize: "10px", color: "#475569", letterSpacing: "0.8px" }}>AI CONFIDENCE</span>
                              <span className="font-mono" style={{ fontSize: "10px", color: s.color, fontWeight: "600" }}>{alert.confidence?.toFixed(0)}%</span>
                            </div>
                            <div style={{ height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "100px", overflow: "hidden" }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${alert.confidence}%` }} transition={{ duration: 0.8, delay: i * 0.04 }}
                                style={{ height: "100%", background: s.color, borderRadius: "100px", boxShadow: `0 0 6px ${s.color}` }} />
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => setFixModal(alert)} style={{ padding: "6px 14px", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: "7px", color: "#a78bfa", fontSize: "12px", fontWeight: "500", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px" }}>
                              <Wand2 size={12} /> AI Fix
                            </button>
                            <button onClick={() => handleResolve(alert.id)} style={{ padding: "6px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "7px", color: "#64748b", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px" }}>
                              <RefreshCw size={12} /> Resolve
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="font-mono" style={{ fontSize: "11px", color: "#475569", whiteSpace: "nowrap", flexShrink: 0 }}>{timeAgo(alert.timestamp)}</div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Fix Modal */}
      <AnimatePresence>
        {fixModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setFixModal(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()} className="glass-panel" style={{ padding: "32px", maxWidth: "460px", width: "90%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Wand2 size={14} color="#a78bfa" />
                <span style={{ fontSize: "11px", color: "#a78bfa", letterSpacing: "1px", fontWeight: "700" }}>AI RECOMMENDATION</span>
              </div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#f8fafc", marginBottom: "4px" }}>{fixModal.alert_type}</div>
              <div className="font-mono" style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>{fixModal.service_name}</div>
              <div style={{ padding: "16px", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "10px", fontSize: "13px", color: "#cbd5e1", lineHeight: "1.7", marginBottom: "20px" }}>
                {fixModal.fix_suggestion || "Restart the service and monitor for 5 minutes."}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => { handleResolve(fixModal.id); setFixModal(null); }} style={{ flex: 1, padding: "11px", background: "#7c3aed", border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Apply Fix</button>
                <button onClick={() => setFixModal(null)} style={{ padding: "11px 20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#94a3b8", fontSize: "13px", cursor: "pointer" }}>Dismiss</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Alerts;