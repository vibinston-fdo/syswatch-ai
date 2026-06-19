import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Navbar from "../components/Navbar";

const statusConfig = {
  healthy: {
    color: "#4ade80",
    glow: "rgba(74,222,128,0.15)",
    bg: "rgba(34,197,94,0.06)",
    border: "rgba(34,197,94,0.15)",
    label: "Healthy",
  },
  warning: {
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.15)",
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.15)",
    label: "Warning",
  },
  critical: {
    color: "#f87171",
    glow: "rgba(248,113,113,0.15)",
    bg: "rgba(239,68,68,0.06)",
    border: "rgba(239,68,68,0.15)",
    label: "Critical",
  },
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchServices = async () => {
    try {
      const res = await axios.get("https://syswatch-ai-backend-25j3.onrender.com/api/services/metrics/latest");
      setServices(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchHistory = async (serviceName) => {
    try {
      const res = await axios.get(`https://syswatch-ai-backend-25j3.onrender.com/api/services/metrics/history/${serviceName}`);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
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

  return (
    <div style={{
      minHeight: "100vh",
      background: "#030308",
      fontFamily: "'Inter', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Background glows */}
      <div style={{
        position: "fixed", top: "-30%", left: "-20%",
        width: "70vw", height: "70vh", borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(124,58,237,0.07) 0%, transparent 70%)",
        pointerEvents: "none", filter: "blur(40px)", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: "-20%", right: "-10%",
        width: "60vw", height: "60vh", borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(6,182,212,0.05) 0%, transparent 70%)",
        pointerEvents: "none", filter: "blur(50px)", zIndex: 0,
      }} />

      {/* Grid */}
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
        <Navbar />

        <div style={{ padding: "32px" }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: "32px" }}
          >
            <h1 style={{
              fontSize: "28px", fontWeight: "700",
              color: "#f8fafc", letterSpacing: "-1px",
              margin: "0 0 6px",
            }}>Services</h1>
            <p style={{ fontSize: "13px", color: "#334155", margin: 0 }}>
              Monitor all microservices in real time
            </p>
          </motion.div>

          {/* Stats row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}>
            {[
              {
                label: "TOTAL",
                value: services.length,
                color: "#818cf8",
                glow: "rgba(129,140,248,0.2)",
              },
              {
                label: "HEALTHY",
                value: services.filter(s => s.status === "healthy").length,
                color: "#4ade80",
                glow: "rgba(74,222,128,0.2)",
              },
              {
                label: "ISSUES",
                value: services.filter(s => s.status !== "healthy").length,
                color: "#f87171",
                glow: "rgba(248,113,113,0.2)",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  background: "rgba(8,8,18,0.85)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "14px", padding: "20px 24px",
                  backdropFilter: "blur(20px)",
                  position: "relative", overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", top: 0,
                  left: "20%", right: "20%", height: "1px",
                  background: `linear-gradient(90deg, transparent, ${stat.glow}, transparent)`,
                }} />
                <div style={{
                  fontSize: "11px", color: "#334155",
                  letterSpacing: "1px", marginBottom: "8px",
                }}>{stat.label}</div>
                <div style={{
                  fontSize: "32px", fontWeight: "700",
                  color: stat.color, letterSpacing: "-1px",
                  textShadow: `0 0 20px ${stat.glow}`,
                }}>{stat.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Services grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "16px",
          }}>
            {loading ? (
              <div style={{
                color: "#334155", fontSize: "13px",
                padding: "40px", gridColumn: "1/-1",
                textAlign: "center",
              }}>Loading services...</div>
            ) : services.map((service, i) => {
              const s = statusConfig[service.status] || statusConfig.healthy;
              return (
                <motion.div
                  key={service.service_id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ scale: 1.02, borderColor: s.border }}
                  onClick={() => handleSelect(service)}
                  style={{
                    background: "rgba(8,8,18,0.85)",
                    border: `1px solid rgba(255,255,255,0.05)`,
                    borderRadius: "16px", padding: "24px",
                    backdropFilter: "blur(20px)",
                    cursor: "pointer", transition: "all 0.2s",
                    position: "relative", overflow: "hidden",
                  }}
                >
                  {/* Left accent */}
                  <div style={{
                    position: "absolute", left: 0,
                    top: 0, bottom: 0, width: "3px",
                    background: s.color,
                    boxShadow: `0 0 12px ${s.glow}`,
                    borderRadius: "16px 0 0 16px",
                  }} />

                  {/* Top shimmer */}
                  <div style={{
                    position: "absolute", top: 0,
                    left: "20%", right: "20%", height: "1px",
                    background: `linear-gradient(90deg, transparent, ${s.color}40, transparent)`,
                  }} />

                  {/* Header */}
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: "20px",
                    paddingLeft: "12px",
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: "10px",
                    }}>
                      <motion.div
                        animate={service.status === "critical"
                          ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }
                          : { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                          width: "8px", height: "8px",
                          borderRadius: "50%", background: s.color,
                          boxShadow: `0 0 8px ${s.color}`,
                        }}
                      />
                      <span style={{
                        fontSize: "14px", fontWeight: "600",
                        color: "#f1f5f9", letterSpacing: "-0.3px",
                      }}>{service.service_name}</span>
                    </div>
                    <div style={{
                      padding: "4px 12px", borderRadius: "100px",
                      background: s.bg, border: `1px solid ${s.border}`,
                      fontSize: "11px", fontWeight: "600",
                      color: s.color, letterSpacing: "0.3px",
                    }}>{s.label}</div>
                  </div>

                  {/* Metrics */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "12px", paddingLeft: "12px",
                  }}>
                    {[
                      { label: "CPU", value: `${service.cpu?.toFixed(1)}%`, warn: service.cpu > 80 },
                      { label: "MEMORY", value: `${service.memory?.toFixed(0)}MB`, warn: service.memory > 1500 },
                      { label: "LATENCY", value: `${service.latency?.toFixed(0)}ms`, warn: service.latency > 500 },
                    ].map((m, j) => (
                      <div key={j} style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.04)",
                        borderRadius: "10px", padding: "12px",
                      }}>
                        <div style={{
                          fontSize: "10px", color: "#334155",
                          letterSpacing: "0.8px", marginBottom: "6px",
                        }}>{m.label}</div>
                        <div style={{
                          fontSize: "18px", fontWeight: "700",
                          color: m.warn ? "#f87171" : "#f1f5f9",
                          letterSpacing: "-0.5px",
                          textShadow: m.warn ? "0 0 12px rgba(248,113,113,0.4)" : "none",
                        }}>{m.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* CPU bar */}
                  <div style={{ paddingLeft: "12px", marginTop: "16px" }}>
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      marginBottom: "6px",
                    }}>
                      <span style={{ fontSize: "10px", color: "#1e293b", letterSpacing: "0.5px" }}>
                        CPU LOAD
                      </span>
                      <span style={{ fontSize: "10px", color: s.color }}>
                        {service.cpu?.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{
                      height: "4px", background: "rgba(255,255,255,0.04)",
                      borderRadius: "100px", overflow: "hidden",
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${service.cpu}%` }}
                        transition={{ duration: 0.8 }}
                        style={{
                          height: "100%",
                          background: `linear-gradient(90deg, ${s.color}, ${s.color}99)`,
                          borderRadius: "100px",
                          boxShadow: `0 0 6px ${s.color}`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Click hint */}
                  <div style={{
                    paddingLeft: "12px", marginTop: "14px",
                    fontSize: "11px", color: "#1e293b",
                  }}>Click to view history →</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              zIndex: 200, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: "rgba(8,8,18,0.98)",
                border: "1px solid rgba(124,58,237,0.2)",
                borderRadius: "20px", padding: "32px",
                maxWidth: "500px", width: "90%",
                boxShadow: "0 0 80px rgba(124,58,237,0.1)",
                position: "relative", overflow: "hidden",
              }}
            >
              {/* Top shimmer */}
              <div style={{
                position: "absolute", top: 0,
                left: "15%", right: "15%", height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.6), transparent)",
              }} />

              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "24px",
              }}>
                <div>
                  <div style={{
                    fontSize: "11px", color: "#a78bfa",
                    letterSpacing: "1px", marginBottom: "4px",
                  }}>SERVICE DETAIL</div>
                  <div style={{
                    fontSize: "20px", fontWeight: "700",
                    color: "#f8fafc", letterSpacing: "-0.5px",
                  }}>{selected.service_name}</div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelected(null)}
                  style={{
                    padding: "8px 16px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "8px", color: "#334155",
                    fontSize: "12px", cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >Close ×</motion.button>
              </div>

              {/* Current metrics */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px", marginBottom: "24px",
              }}>
                {[
                  { label: "CPU", value: `${selected.cpu?.toFixed(1)}%` },
                  { label: "MEMORY", value: `${selected.memory?.toFixed(0)}MB` },
                  { label: "LATENCY", value: `${selected.latency?.toFixed(0)}ms` },
                ].map((m, i) => (
                  <div key={i} style={{
                    background: "rgba(124,58,237,0.06)",
                    border: "1px solid rgba(124,58,237,0.15)",
                    borderRadius: "10px", padding: "14px",
                    textAlign: "center",
                  }}>
                    <div style={{
                      fontSize: "10px", color: "#475569",
                      letterSpacing: "0.8px", marginBottom: "6px",
                    }}>{m.label}</div>
                    <div style={{
                      fontSize: "20px", fontWeight: "700",
                      color: "#a78bfa", letterSpacing: "-0.5px",
                    }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* History */}
              <div style={{
                fontSize: "11px", color: "#334155",
                letterSpacing: "0.8px", marginBottom: "12px",
              }}>RECENT HISTORY ({history.length} records)</div>

              <div style={{
                maxHeight: "200px", overflowY: "auto",
                display: "flex", flexDirection: "column", gap: "6px",
              }}>
                {history.slice(-10).reverse().map((h, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    borderRadius: "8px", fontSize: "12px",
                  }}>
                    <span style={{ color: "#475569" }}>
                      {new Date(h.timestamp).toLocaleTimeString()}
                    </span>
                    <span style={{ color: "#818cf8" }}>CPU {h.cpu?.toFixed(1)}%</span>
                    <span style={{ color: "#38bdf8" }}>{h.memory?.toFixed(0)}MB</span>
                    <span style={{ color: "#4ade80" }}>{h.latency?.toFixed(0)}ms</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
};

export default Services;