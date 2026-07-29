import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import Sidebar from "../components/Sidebar";
import MetricCard from "../components/MetricCard";
import ServiceCard from "../components/ServiceCard";
import AlertItem from "../components/AlertItem";
import LiveChart from "../components/LiveChart";
import NetworkBackground from "../components/NetworkBackground";
import TerminalLog from "../components/TerminalLog";

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

const Dashboard = () => {
  const [services, setServices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [cpuHistory, setCpuHistory] = useState([]);
  const [memHistory, setMemHistory] = useState([]);
  const [fixModal, setFixModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { displayed, done } = useTypewriter("Real-time system intelligence.");
  
  const [terminalLogs, setTerminalLogs] = useState([
    { time: new Date().toLocaleTimeString(), message: "System initialized. Connecting to Neural Mesh...", color: "#4ade80" },
    { time: new Date().toLocaleTimeString(), message: "Awaiting anomaly telemetry...", color: "#94a3b8" }
  ]);

  const addLog = (message, color = "#cbd5e1") => {
    setTerminalLogs(prev => [...prev.slice(-49), { time: new Date().toLocaleTimeString(), message, color }]);
  };

  const handleResolve = useCallback(async (alertId, isAuto = false, alertData = null) => {
    try {
      await api.put(`/api/alerts/resolve/${alertId}`);
      if (isAuto && alertData) {
        addLog(`⚡ AUTO-PILOT REMEDIATION: Resolved ${alertData.alert_type} on ${alertData.service_name}`, "#0ea5e9");
      } else {
        addLog(`User resolved alert #${alertId}`, "#a78bfa");
      }
      fetchData(false); // Fetch silently without setting loading
    } catch (err) {
      console.error(err);
      addLog(`ERROR: Failed to resolve alert #${alertId}`, "#f87171");
    }
  }, []);

  const fetchData = useCallback(async (isInitial = true) => {
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

      // Auto-Pilot Logic
      const autoPilot = localStorage.getItem("autoPilot") === "true";
      if (autoPilot) {
        const activeAlerts = alertsRes.data.filter(a => !a.resolved);
        for (const alert of activeAlerts) {
          if (alert.confidence > 75) {
            handleResolve(alert.id, true, alert);
          }
        }
      }

    } catch (err) {
      console.error("Failed to fetch data", err);
      if(isInitial) addLog("ERROR: Connection to telemetry server lost.", "#f87171");
    }
    if (isInitial) setLoading(false);
  }, [handleResolve]);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const totalServices = services.length;
  const healthyServices = services.filter(s => s.status === "healthy").length;
  const avgCpu = services.length ? (services.reduce((a, b) => a + b.cpu, 0) / services.length).toFixed(1) : 0;
  const activeAlerts = alerts.length;

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <NetworkBackground />

      {/* Subtle glowing orbs */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
        style={{
          position: "fixed", top: "-20%", left: "10%",
          width: "50vw", height: "50vh", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(14,165,233,0.06) 0%, transparent 70%)",
          pointerEvents: "none", filter: "blur(60px)", zIndex: 0,
        }}
      />

      <Sidebar alertCount={activeAlerts} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ position: "relative", zIndex: 1, padding: "32px 40px" }}>
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginBottom: "40px" }}>
          <div className="font-sans" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", letterSpacing: "1px" }}>PLATFORM / </span>
            <span style={{ fontSize: "12px", color: "#0ea5e9", fontWeight: "600", letterSpacing: "1px" }}>DASHBOARD</span>
          </div>

          <h1 style={{
            fontSize: "36px", fontWeight: "700", letterSpacing: "-1.5px", margin: "0 0 8px",
            color: "#f8fafc", display: "flex", alignItems: "center"
          }}>
            {displayed}{!done && <span className="cursor" />}
          </h1>
          <p className="font-sans" style={{ fontSize: "14px", color: "#94a3b8", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            Monitoring {totalServices} nodes <span style={{ color: "#334155" }}>|</span> {activeAlerts > 0 ? <span style={{ color: "#f87171" }}>{activeAlerts} anomalies detected</span> : <span style={{ color: "#4ade80" }}>Neural mesh nominal</span>}
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
          <MetricCard index={0} label="ACTIVE NODES" value={totalServices || "—"} sub={`${healthyServices} healthy`} subColor="#4ade80" icon="◈" glowColor="rgba(14,165,233,0.2)" />
          <MetricCard index={1} label="MESH AVG CPU" value={`${avgCpu}%`} sub={avgCpu > 70 ? "High load" : "Normal range"} subColor={avgCpu > 70 ? "#fbbf24" : "#4ade80"} icon="◎" glowColor="rgba(139,92,246,0.2)" />
          <MetricCard index={2} label="ACTIVE THREATS" value={activeAlerts || "0"} sub={activeAlerts > 0 ? "Action needed" : "All clear"} subColor={activeAlerts > 0 ? "#f87171" : "#4ade80"} icon="⊗" glowColor="rgba(239,68,68,0.2)" />
          <MetricCard index={3} label="UPTIME" value="99.9%" sub="Last 30 days" subColor="#4ade80" icon="◇" glowColor="rgba(74,222,128,0.2)" />
        </div>

        {/* Main Content Panels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div className="font-sans" style={{ fontSize: "14px", fontWeight: "600", color: "#f8fafc" }}>Service Topology</div>
            </div>
            {loading ? <div className="font-mono" style={{ color: "#64748b", fontSize: "12px", padding: "20px" }}>Loading topology...</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {services.map((service, i) => (
                  <ServiceCard key={service.service_id} index={i} name={service.service_name} status={service.status} cpu={service.cpu} memory={service.memory} latency={service.latency} />
                ))}
              </div>
            )}
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel" style={{ padding: "24px", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div className="font-sans" style={{ fontSize: "14px", fontWeight: "600", color: "#f8fafc" }}>Live Anomalies</div>
              </div>
              {loading ? <div className="font-mono" style={{ color: "#64748b", fontSize: "12px", padding: "20px" }}>Analyzing logs...</div> : alerts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <div style={{ fontSize: "13px", color: "#4ade80", fontWeight: "500", marginBottom: "4px" }}>Mesh nominal</div>
                  <div className="font-mono" style={{ fontSize: "12px", color: "#64748b" }}>No anomalies detected in the last 24h</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <AnimatePresence>
                    {alerts.map((alert, i) => (
                      <AlertItem key={alert.id} alert={alert} index={i} onResolve={(id) => handleResolve(id)} onFix={setFixModal} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>
        </div>
        
        {/* Terminal Log */}
        <div style={{ marginBottom: "24px" }}>
           <TerminalLog logs={terminalLogs} />
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <LiveChart index={0} title="CPU usage by service" data={cpuHistory} dataKey="cpu" color="#0ea5e9" unit="%" type="area" />
          <LiveChart index={1} title="Memory usage by service" data={memHistory} dataKey="memory" color="#8b5cf6" unit="MB" type="area" />
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
              style={{ padding: "32px", maxWidth: "460px", width: "100%", border: "1px solid rgba(14,165,233,0.3)" }}
            >
              <div className="font-sans" style={{ fontSize: "10px", color: "#0ea5e9", letterSpacing: "1px", fontWeight: "700", marginBottom: "8px" }}>AI REMEDIATION PROPOSAL</div>
              <div style={{ fontSize: "18px", fontWeight: "600", color: "#f8fafc", marginBottom: "4px" }}>{fixModal.alert_type}</div>
              <div className="font-mono" style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "20px" }}>Target: {fixModal.service_name}</div>
              
              <div className="font-mono" style={{ padding: "16px", background: "rgba(14,165,233,0.1)", borderRadius: "8px", border: "1px solid rgba(14,165,233,0.2)", fontSize: "12px", color: "#cbd5e1", lineHeight: "1.6", marginBottom: "24px" }}>
                {fixModal.fix_suggestion || "Restart the service and monitor for 5 minutes."}
              </div>
              
              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => { handleResolve(fixModal.id); setFixModal(null); }} className="font-sans" style={{ flex: 1, padding: "10px", background: "#0ea5e9", border: "none", borderRadius: "6px", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Apply Fix</button>
                <button onClick={() => setFixModal(null)} className="font-sans" style={{ padding: "10px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#cbd5e1", fontSize: "13px", cursor: "pointer" }}>Dismiss</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;