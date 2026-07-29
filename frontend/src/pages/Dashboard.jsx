import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import Sidebar from "../components/Sidebar";
import MetricCard from "../components/MetricCard";
import ServiceCard from "../components/ServiceCard";
import AlertItem from "../components/AlertItem";
import LiveChart from "../components/LiveChart";

const useTypewriter = (text, speed = 80) => {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    setDisplayed("");
    setDone(false);
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return { displayed, done };
};

const Particles = () => (
  <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        style={{
          position: "absolute",
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${Math.random() * 3 + 1}px`,
          height: `${Math.random() * 3 + 1}px`,
          borderRadius: "50%",
          background: `rgba(${Math.random() > 0.5 ? "124,58,237" : "56,189,248"},${Math.random() * 0.5 + 0.1})`,
        }}
        animate={{ y: [0, -30, 0], opacity: [0, 1, 0], scale: [0, 1, 0] }}
        transition={{ duration: Math.random() * 6 + 4, repeat: Infinity, delay: Math.random() * 5, ease: "easeInOut" }}
      />
    ))}
  </div>
);

const Dashboard = () => {
  const [services, setServices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [cpuHistory, setCpuHistory] = useState([]);
  const [memHistory, setMemHistory] = useState([]);
  const [fixModal, setFixModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { displayed, done } = useTypewriter("Real-time system intelligence.");

  const fetchData = async () => {
    try {
      const [servicesRes, alertsRes] = await Promise.all([
        api.get("/api/services/metrics/latest"),
        api.get("/api/alerts/active"),
      ]);
      setServices(servicesRes.data);
      setAlerts(alertsRes.data.slice(0, 4));

      setCpuHistory(servicesRes.data.map(s => ({
        name: s.service_name.replace(" Service", ""),
        cpu: parseFloat(s.cpu?.toFixed(1)),
      })));

      setMemHistory(servicesRes.data.map(s => ({
        name: s.service_name.replace(" Service", ""),
        memory: parseFloat(s.memory?.toFixed(0)),
      })));

    } catch (err) {
      console.error("Failed to fetch data", err);
    }
    setLoading(false);
  };

  const handleResolve = async (alertId) => {
    try {
      await api.put(`/api/alerts/resolve/${alertId}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalServices = services.length;
  const healthyServices = services.filter(s => s.status === "healthy").length;
  const avgCpu = services.length ? (services.reduce((a, b) => a + b.cpu, 0) / services.length).toFixed(1) : 0;
  const activeAlerts = alerts.length;

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <Particles />

      {/* Subtle glowing orbs */}
      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
        style={{
          position: "fixed", top: "-20%", left: "10%",
          width: "50vw", height: "50vh", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)",
          pointerEvents: "none", filter: "blur(60px)", zIndex: 0,
        }}
      />
      
      {/* Grid overlay */}
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
        backgroundSize: "64px 64px", pointerEvents: "none", zIndex: 0,
      }} />

      <Sidebar alertCount={activeAlerts} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ position: "relative", zIndex: 1, padding: "32px 40px" }}>
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", letterSpacing: "1px" }}>PLATFORM / </span>
            <span style={{ fontSize: "12px", color: "#f8fafc", fontWeight: "600", letterSpacing: "1px" }}>DASHBOARD</span>
          </div>

          <h1 style={{
            fontSize: "32px", fontWeight: "700", letterSpacing: "-1px", margin: "0 0 8px",
            color: "#f8fafc", display: "flex", alignItems: "center"
          }}>
            {displayed}{!done && <span className="cursor" />}
          </h1>
          <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            Monitoring {totalServices} services <span style={{ color: "#334155" }}>|</span> {activeAlerts > 0 ? <span style={{ color: "#f87171" }}>{activeAlerts} anomalies detected</span> : <span style={{ color: "#4ade80" }}>All systems nominal</span>}
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
          <MetricCard index={0} label="TOTAL SERVICES" value={totalServices || "—"} sub={`${healthyServices} healthy`} subColor="#4ade80" icon="◈" glowColor="rgba(99,102,241,0.2)" />
          <MetricCard index={1} label="AVG CPU USAGE" value={`${avgCpu}%`} sub={avgCpu > 70 ? "High load" : "Normal range"} subColor={avgCpu > 70 ? "#fbbf24" : "#4ade80"} icon="◎" glowColor="rgba(6,182,212,0.2)" />
          <MetricCard index={2} label="ACTIVE ALERTS" value={activeAlerts || "0"} sub={activeAlerts > 0 ? "Action needed" : "All clear"} subColor={activeAlerts > 0 ? "#f87171" : "#4ade80"} icon="⊗" glowColor="rgba(239,68,68,0.2)" />
          <MetricCard index={3} label="UPTIME" value="99.9%" sub="Last 30 days" subColor="#4ade80" icon="◇" glowColor="rgba(74,222,128,0.2)" />
        </div>

        {/* Main Content Panels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#f8fafc" }}>Service Health</div>
            </div>
            {loading ? <div className="font-mono" style={{ color: "#64748b", fontSize: "12px", padding: "20px" }}>Loading metrics...</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {services.map((service, i) => (
                  <ServiceCard key={service.service_id} index={i} name={service.service_name} status={service.status} cpu={service.cpu} memory={service.memory} latency={service.latency} />
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#f8fafc" }}>Recent Anomalies</div>
            </div>
            {loading ? <div className="font-mono" style={{ color: "#64748b", fontSize: "12px", padding: "20px" }}>Analyzing logs...</div> : alerts.length === 0 ? (
               <div style={{ textAlign: "center", padding: "40px" }}>
                 <div style={{ fontSize: "13px", color: "#4ade80", fontWeight: "500", marginBottom: "4px" }}>Systems nominal</div>
                 <div style={{ fontSize: "12px", color: "#64748b" }}>No anomalies detected in the last 24h</div>
               </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <AnimatePresence>
                  {alerts.map((alert, i) => (
                    <AlertItem key={alert.id} alert={alert} index={i} onResolve={handleResolve} onFix={setFixModal} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <LiveChart index={0} title="CPU usage by service" data={cpuHistory} dataKey="cpu" color="#818cf8" unit="%" type="area" />
          <LiveChart index={1} title="Memory usage by service" data={memHistory} dataKey="memory" color="#38bdf8" unit="MB" type="area" />
        </div>
      </div>
      
      {/* Fix Modal */}
      <AnimatePresence>
        {fixModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setFixModal(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="glass-panel"
              style={{ padding: "32px", maxWidth: "460px", width: "100%" }}
            >
              <div style={{ fontSize: "10px", color: "#a78bfa", letterSpacing: "1px", fontWeight: "700", marginBottom: "8px" }}>AI RECOMMENDATION</div>
              <div style={{ fontSize: "18px", fontWeight: "600", color: "#f8fafc", marginBottom: "4px" }}>{fixModal.alert_type}</div>
              <div className="font-mono" style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "20px" }}>Target: {fixModal.service_name}</div>
              
              <div style={{ padding: "16px", background: "rgba(124,58,237,0.1)", borderRadius: "8px", border: "1px solid rgba(124,58,237,0.2)", fontSize: "13px", color: "#cbd5e1", lineHeight: "1.6", marginBottom: "24px" }}>
                {fixModal.fix_suggestion || "Restart the service and monitor for 5 minutes."}
              </div>
              
              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => { handleResolve(fixModal.id); setFixModal(null); }} style={{ flex: 1, padding: "10px", background: "#7c3aed", border: "none", borderRadius: "6px", color: "#fff", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>Apply Fix</button>
                <button onClick={() => setFixModal(null)} style={{ padding: "10px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#cbd5e1", fontSize: "13px", cursor: "pointer" }}>Dismiss</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;