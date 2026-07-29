import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import Sidebar from "../components/Sidebar";
import NetworkBackground from "../components/NetworkBackground";
import { Cpu, MemoryStick, Clock } from "lucide-react";

const statusConfig = {
  healthy: { color: "#4ade80", glow: "rgba(74,222,128,0.2)", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", label: "Healthy" },
  warning: { color: "#fbbf24", glow: "rgba(251,191,36,0.2)", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", label: "Warning" },
  critical: { color: "#f87171", glow: "rgba(248,113,113,0.2)", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", label: "Critical" },
};

const MetricBadge = ({ label, value, warn, icon: Icon }) => (
  <div style={{
    background: warn ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${warn ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`,
    borderRadius: "10px", padding: "12px",
  }}>
    <div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "0.8px", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
      {Icon && <Icon size={10} />} {label}
    </div>
    <div className="font-mono" style={{
      fontSize: "18px", fontWeight: "600",
      color: warn ? "#f87171" : "#f1f5f9",
      letterSpacing: "-0.5px",
    }}>{value}</div>
  </div>
);

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await api.get("/api/services/metrics/latest");
      setServices(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchHistory = async (serviceName) => {
    try {
      const res = await api.get(`/api/services/metrics/history/${serviceName}`);
      setHistory(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSelect = (service) => {
    setSelected(service);
    fetchHistory(service.service_name);
  };

  useEffect(() => {
    fetchServices();
    const interval = setInterval(fetchServices, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalIssues = services.filter(s => s.status !== "healthy").length;

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Background grid */}
      <NetworkBackground />

      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ position: "relative", zIndex: 1, padding: "32px 40px" }}>
        
        {/* Breadcrumb + Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", letterSpacing: "1px" }}>PLATFORM / </span>
            <span style={{ fontSize: "12px", color: "#f8fafc", fontWeight: "600", letterSpacing: "1px" }}>SERVICES</span>
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: "700", letterSpacing: "-1px", margin: "0 0 8px", color: "#f8fafc" }}>Services</h1>
          <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>
            {services.length} microservices monitored — {totalIssues > 0 ? <span style={{ color: "#f87171" }}>{totalIssues} with issues</span> : <span style={{ color: "#4ade80" }}>all healthy</span>}
          </p>
        </motion.div>

        {/* Stats Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
          {[
            { label: "TOTAL", value: services.length, color: "#818cf8" },
            { label: "HEALTHY", value: services.filter(s => s.status === "healthy").length, color: "#4ade80" },
            { label: "ISSUES", value: totalIssues, color: "#f87171" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-panel" style={{ padding: "20px 24px" }}>
              <div style={{ fontSize: "11px", color: "#64748b", letterSpacing: "1px", marginBottom: "8px" }}>{stat.label}</div>
              <div className="font-mono" style={{ fontSize: "32px", fontWeight: "700", color: stat.color }}>{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Services Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
          {loading ? (
            <div className="font-mono" style={{ color: "#64748b", fontSize: "12px", padding: "40px", gridColumn: "1/-1", textAlign: "center" }}>
              Connecting to services...
            </div>
          ) : services.map((service, i) => {
            const s = statusConfig[service.status] || statusConfig.healthy;
            return (
              <motion.div
                key={service.service_id}
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.015, boxShadow: `0 8px 32px ${s.glow}` }}
                onClick={() => handleSelect(service)}
                className="glass-panel"
                style={{ padding: "24px", cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
              >
                {/* Status accent bar */}
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "3px", background: s.color, boxShadow: `0 0 10px ${s.color}`, borderRadius: "16px 0 0 16px" }} />
                
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingLeft: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <motion.div animate={service.status === "critical" ? { scale: [1, 1.4, 1], opacity: [1, 0.4, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }}
                      style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#f1f5f9" }}>{service.service_name}</span>
                  </div>
                  <span style={{ padding: "3px 10px", borderRadius: "100px", background: s.bg, border: `1px solid ${s.border}`, fontSize: "11px", fontWeight: "600", color: s.color }}>{s.label}</span>
                </div>

                {/* Metric badges */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", paddingLeft: "12px", marginBottom: "16px" }}>
                  <MetricBadge label="CPU" value={`${service.cpu?.toFixed(1)}%`} warn={service.cpu > 80} icon={Cpu} />
                  <MetricBadge label="MEMORY" value={`${service.memory?.toFixed(0)}MB`} warn={service.memory > 1500} icon={MemoryStick} />
                  <MetricBadge label="LATENCY" value={`${service.latency?.toFixed(0)}ms`} warn={service.latency > 500} icon={Clock} />
                </div>

                {/* CPU bar */}
                <div style={{ paddingLeft: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "10px", color: "#475569", letterSpacing: "0.5px" }}>CPU LOAD</span>
                    <span className="font-mono" style={{ fontSize: "10px", color: s.color }}>{service.cpu?.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "100px", overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${service.cpu}%` }} transition={{ duration: 0.8 }}
                      style={{ height: "100%", background: `linear-gradient(90deg, ${s.color}, ${s.color}80)`, borderRadius: "100px", boxShadow: `0 0 6px ${s.color}60` }} />
                  </div>
                </div>

                <div style={{ paddingLeft: "12px", marginTop: "14px", fontSize: "11px", color: "#475569" }}>Click to view history →</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="glass-panel"
              style={{ padding: "32px", maxWidth: "520px", width: "90%" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#a78bfa", letterSpacing: "1px", marginBottom: "4px" }}>SERVICE DETAIL</div>
                  <div style={{ fontSize: "22px", fontWeight: "700", color: "#f8fafc" }}>{selected.service_name}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#94a3b8", fontSize: "12px", cursor: "pointer" }}>
                  Close ×
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
                {[
                  { label: "CPU", value: `${selected.cpu?.toFixed(1)}%` },
                  { label: "MEMORY", value: `${selected.memory?.toFixed(0)} MB` },
                  { label: "LATENCY", value: `${selected.latency?.toFixed(0)} ms` },
                ].map((m, i) => (
                  <div key={i} style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "0.8px", marginBottom: "6px" }}>{m.label}</div>
                    <div className="font-mono" style={{ fontSize: "20px", fontWeight: "700", color: "#a78bfa" }}>{m.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: "11px", color: "#64748b", letterSpacing: "0.8px", marginBottom: "12px" }}>RECENT HISTORY ({history.length} records)</div>
              <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                {history.slice(-10).reverse().map((h, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "8px" }}>
                    <span className="font-mono" style={{ fontSize: "11px", color: "#64748b" }}>{new Date(h.timestamp).toLocaleTimeString()}</span>
                    <span className="font-mono" style={{ fontSize: "11px", color: "#818cf8" }}>CPU {h.cpu?.toFixed(1)}%</span>
                    <span className="font-mono" style={{ fontSize: "11px", color: "#38bdf8" }}>{h.memory?.toFixed(0)} MB</span>
                    <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80" }}>{h.latency?.toFixed(0)} ms</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Services;