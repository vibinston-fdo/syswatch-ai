import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Navbar from "../components/Navbar";
import MetricCard from "../components/MetricCard";
import ServiceCard from "../components/ServiceCard";
import AlertItem from "../components/AlertItem";
import LiveChart from "../components/LiveChart";

// Typewriter hook
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

// Floating particles
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
          background: `rgba(${Math.random() > 0.5 ? "124,58,237" : "56,189,248"},${Math.random() * 0.5 + 0.2})`,
        }}
        animate={{
          y: [0, -30, 0],
          opacity: [0, 1, 0],
          scale: [0, 1, 0],
        }}
        transition={{
          duration: Math.random() * 6 + 4,
          repeat: Infinity,
          delay: Math.random() * 5,
          ease: "easeInOut",
        }}
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
  const { displayed, done } = useTypewriter("Real-time system intelligence.");

  const fetchData = async () => {
    try {
      const [servicesRes, alertsRes] = await Promise.all([
        axios.get("https://syswatch-ai-backend-25j3.onrender.com/api/services/metrics/latest"),
        axios.get("https://syswatch-ai-backend-25j3.onrender.com/api/alerts/active"),
      ]);
      setServices(servicesRes.data);
      setAlerts(alertsRes.data.slice(0, 4));

      const cpuData = servicesRes.data.map(s => ({
        name: s.service_name.replace(" Service", ""),
        cpu: parseFloat(s.cpu?.toFixed(1)),
      }));
      setCpuHistory(cpuData);

      const memData = servicesRes.data.map(s => ({
        name: s.service_name.replace(" Service", ""),
        memory: parseFloat(s.memory?.toFixed(0)),
      }));
      setMemHistory(memData);

    } catch (err) {
      console.error("Failed to fetch data", err);
    }
    setLoading(false);
  };

  const handleResolve = async (alertId) => {
    try {
      await axios.put(`https://syswatch-ai-backend-25j3.onrender.com/api/alerts/resolve/${alertId}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFix = (alert) => setFixModal(alert);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalServices = services.length;
  const healthyServices = services.filter(s => s.status === "healthy").length;
  const avgCpu = services.length
    ? (services.reduce((a, b) => a + b.cpu, 0) / services.length).toFixed(1)
    : 0;
  const activeAlerts = alerts.length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#030308",
      fontFamily: "'Inter', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>

      <Particles />

      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
        style={{
          position: "fixed", top: "-30%", left: "-20%",
          width: "70vw", height: "70vh", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)",
          pointerEvents: "none", filter: "blur(40px)", zIndex: 0,
        }}
      />
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        style={{
          position: "fixed", bottom: "-20%", right: "-10%",
          width: "60vw", height: "60vh", borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(6,182,212,0.06) 0%, transparent 70%)",
          pointerEvents: "none", filter: "blur(50px)", zIndex: 0,
        }}
      />

      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)
        `,
        backgroundSize: "72px 72px",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar alertCount={activeAlerts} />

        <div style={{ padding: "32px" }}>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ marginBottom: "36px" }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 14px",
                borderRadius: "100px",
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.2)",
                marginBottom: "16px",
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: "#22c55e", boxShadow: "0 0 6px #22c55e",
                }}
              />
              <span style={{ fontSize: "11px", color: "#a78bfa", letterSpacing: "0.8px", fontWeight: "500" }}>
                SYSTEM OVERVIEW
              </span>
            </motion.div>

           <h1 style={{
             fontSize: "36px",
             fontWeight: "800",
             letterSpacing: "-1.5px",
             margin: "0 0 8px",
             lineHeight: 1.1,
             background: "linear-gradient(135deg, #f8fafc 0%, #a78bfa 50%, #38bdf8 100%)",
             WebkitBackgroundClip: "text",
             WebkitTextFillColor: "transparent",
           }}>
             {displayed}
             {!done && <span className="cursor" />}
           </h1>
            <p style={{ fontSize: "13px", color: "#334155", margin: 0 }}>
              Monitoring {totalServices} services • {activeAlerts > 0
                ? `${activeAlerts} anomalies detected`
                : "All systems operational"}
            </p>
          </motion.div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}>
            <MetricCard index={0} label="TOTAL SERVICES" value={totalServices || "—"}
              sub={`${healthyServices} healthy`} subColor="#4ade80" icon="◈"
              glowColor="rgba(99,102,241,0.3)" />
            <MetricCard index={1} label="AVG CPU USAGE" value={`${avgCpu}%`}
              sub={avgCpu > 70 ? "⚠ High load" : "Normal range"}
              subColor={avgCpu > 70 ? "#fbbf24" : "#4ade80"} icon="◎"
              glowColor="rgba(6,182,212,0.3)" />
            <MetricCard index={2} label="ACTIVE ANOMALIES" value={activeAlerts || "0"}
              sub={activeAlerts > 0 ? "Action needed" : "All clear"}
              subColor={activeAlerts > 0 ? "#f87171" : "#4ade80"} icon="⊗"
              glowColor="rgba(239,68,68,0.2)" />
            <MetricCard index={3} label="UPTIME" value="99.9%"
              sub="Last 30 days" subColor="#4ade80" icon="◇"
              glowColor="rgba(74,222,128,0.2)" />
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "24px",
          }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="neon-border"
              style={{
                background: "rgba(8,8,18,0.85)",
                borderRadius: "16px", padding: "24px",
                backdropFilter: "blur(20px)",
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: 0,
                left: "20%", right: "20%", height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)",
              }} />
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "16px",
              }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>
                  Service health
                </div>
                <div style={{ fontSize: "11px", color: "#1e293b" }}>
                  {totalServices} monitored
                </div>
              </div>
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#1e293b", fontSize: "13px" }}>
                  Loading services...
                </div>
              ) : services.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#1e293b", fontSize: "13px" }}>
                  Start the simulator to see services
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {services.map((service, i) => (
                    <ServiceCard
                      key={service.service_id} index={i}
                      name={service.service_name} status={service.status}
                      cpu={service.cpu} memory={service.memory} latency={service.latency}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="neon-border"
              style={{
                background: "rgba(8,8,18,0.85)",
                borderRadius: "16px", padding: "24px",
                backdropFilter: "blur(20px)",
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: 0,
                left: "20%", right: "20%", height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.4), transparent)",
              }} />
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "16px",
              }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>
                  AI anomaly alerts
                </div>
                <AnimatePresence>
                  {activeAlerts > 0 && (
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      style={{
                        padding: "3px 10px", borderRadius: "100px",
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        fontSize: "11px", color: "#f87171", fontWeight: "600",
                        display: "flex", alignItems: "center", gap: "6px",
                      }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{
                          width: "5px", height: "5px", borderRadius: "50%",
                          background: "#f87171", boxShadow: "0 0 6px #f87171",
                        }}
                      />
                      {activeAlerts} active
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#1e293b", fontSize: "13px" }}>
                  Loading alerts...
                </div>
              ) : alerts.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ textAlign: "center", padding: "40px" }}>
                  <div style={{ fontSize: "36px", marginBottom: "12px" }}>◎</div>
                  <div style={{ fontSize: "13px", color: "#4ade80", fontWeight: "500", marginBottom: "4px" }}>
                    All systems nominal
                  </div>
                  <div style={{ fontSize: "12px", color: "#1e293b" }}>No anomalies detected</div>
                </motion.div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <AnimatePresence>
                    {alerts.map((alert, i) => (
                      <AlertItem key={alert.id} alert={alert} index={i}
                        onResolve={handleResolve} onFix={handleFix} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <LiveChart index={0} title="CPU usage by service" data={cpuHistory}
              dataKey="cpu" color="#818cf8" unit="%" type="bar" />
            <LiveChart index={1} title="Memory usage by service" data={memHistory}
              dataKey="memory" color="#38bdf8" unit="MB" type="area" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {fixModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setFixModal(null)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(12px)",
              zIndex: 200, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: "spring", bounce: 0.3 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: "rgba(8,8,18,0.98)",
                border: "1px solid rgba(124,58,237,0.25)",
                borderRadius: "20px", padding: "32px",
                maxWidth: "460px", width: "90%",
                boxShadow: "0 0 100px rgba(124,58,237,0.15)",
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: 0,
                left: "15%", right: "15%", height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.8), transparent)",
              }} />
              <div style={{ fontSize: "10px", color: "#a78bfa", letterSpacing: "1.5px", fontWeight: "700", marginBottom: "8px" }}>
                ⚡ AI RECOMMENDATION
              </div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#f8fafc", letterSpacing: "-0.5px", marginBottom: "4px" }}>
                {fixModal.alert_type}
              </div>
              <div style={{ fontSize: "12px", color: "#334155", marginBottom: "20px" }}>
                {fixModal.service_name}
              </div>
              <div style={{
                padding: "16px",
                background: "rgba(124,58,237,0.06)",
                border: "1px solid rgba(124,58,237,0.15)",
                borderRadius: "12px", fontSize: "13px",
                color: "#94a3b8", lineHeight: "1.7", marginBottom: "20px",
              }}>
                {fixModal.fix_suggestion || "Restart the service and monitor for 5 minutes."}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { handleResolve(fixModal.id); setFixModal(null); }}
                  style={{
                    flex: 1, padding: "12px",
                    background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                    border: "none", borderRadius: "10px",
                    color: "#fff", fontSize: "13px", fontWeight: "600",
                    cursor: "pointer", fontFamily: "inherit",
                    boxShadow: "0 0 20px rgba(124,58,237,0.3)",
                  }}
                >Apply fix →</motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setFixModal(null)}
                  style={{
                    padding: "12px 20px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "10px", color: "#334155",
                    fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                  }}
                >Dismiss</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
};

export default Dashboard;