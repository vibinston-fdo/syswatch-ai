import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Navbar from "../components/Navbar";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [fixModal, setFixModal] = useState(null);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/alerts/");
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleResolve = async (alertId) => {
    try {
      await axios.put(`http://localhost:8000/api/alerts/resolve/${alertId}`);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
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
    critical: {
      color: "#f87171",
      glow: "rgba(248,113,113,0.15)",
      bg: "rgba(239,68,68,0.06)",
      border: "rgba(239,68,68,0.15)",
      icon: "⊗",
    },
    warning: {
      color: "#fbbf24",
      glow: "rgba(251,191,36,0.15)",
      bg: "rgba(245,158,11,0.06)",
      border: "rgba(245,158,11,0.15)",
      icon: "⚠",
    },
  };

  const timeAgo = (timestamp) => {
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

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
        background: "radial-gradient(ellipse, rgba(239,68,68,0.05) 0%, transparent 70%)",
        pointerEvents: "none", filter: "blur(40px)", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: "-20%", right: "-10%",
        width: "60vw", height: "60vh", borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)",
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
            style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", marginBottom: "32px",
            }}
          >
            <div>
              <h1 style={{
                fontSize: "28px", fontWeight: "700",
                color: "#f8fafc", letterSpacing: "-1px",
                margin: "0 0 6px",
              }}>Alerts</h1>
              <p style={{ fontSize: "13px", color: "#334155", margin: 0 }}>
                AI-detected anomalies across all services
              </p>
            </div>

            {/* Active count badge */}
            {alerts.filter(a => !a.resolved).length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  padding: "8px 16px",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "100px",
                  display: "flex", alignItems: "center", gap: "8px",
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: "#f87171", boxShadow: "0 0 8px #f87171",
                  }}
                />
                <span style={{
                  fontSize: "12px", color: "#f87171",
                  fontWeight: "600", letterSpacing: "0.3px",
                }}>
                  {alerts.filter(a => !a.resolved).length} active
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Stats row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px", marginBottom: "24px",
          }}>
            {[
              {
                label: "TOTAL ALERTS",
                value: alerts.length,
                color: "#818cf8",
              },
              {
                label: "ACTIVE",
                value: alerts.filter(a => !a.resolved).length,
                color: "#f87171",
              },
              {
                label: "RESOLVED",
                value: alerts.filter(a => a.resolved).length,
                color: "#4ade80",
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
                  background: `linear-gradient(90deg, transparent, ${stat.color}40, transparent)`,
                }} />
                <div style={{
                  fontSize: "11px", color: "#334155",
                  letterSpacing: "1px", marginBottom: "8px",
                }}>{stat.label}</div>
                <div style={{
                  fontSize: "32px", fontWeight: "700",
                  color: stat.color, letterSpacing: "-1px",
                }}>{stat.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Filter tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: "flex", gap: "8px", marginBottom: "20px",
            }}
          >
            {["all", "active", "resolved"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "7px 16px",
                  background: filter === f
                    ? "rgba(124,58,237,0.1)"
                    : "rgba(255,255,255,0.02)",
                  border: filter === f
                    ? "1px solid rgba(124,58,237,0.3)"
                    : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "8px",
                  color: filter === f ? "#a78bfa" : "#334155",
                  fontSize: "12px", fontWeight: "500",
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.2s",
                  letterSpacing: "0.3px",
                  textTransform: "capitalize",
                }}
              >{f}</button>
            ))}
          </motion.div>

          {/* Alerts list */}
          <div style={{
            display: "flex", flexDirection: "column", gap: "10px",
          }}>
            {loading ? (
              <div style={{
                textAlign: "center", padding: "60px",
                color: "#334155", fontSize: "13px",
              }}>Loading alerts...</div>
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  textAlign: "center", padding: "80px",
                  background: "rgba(8,8,18,0.85)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "16px",
                }}
              >
                <div style={{ fontSize: "40px", marginBottom: "16px" }}>◎</div>
                <div style={{
                  fontSize: "14px", color: "#4ade80",
                  fontWeight: "500", marginBottom: "6px",
                }}>All clear!</div>
                <div style={{ fontSize: "12px", color: "#1e293b" }}>
                  No {filter === "all" ? "" : filter} alerts found
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {filtered.map((alert, i) => {
                  const s = alert.resolved
                    ? { color: "#4ade80", glow: "rgba(74,222,128,0.15)", bg: "rgba(34,197,94,0.06)", border: "rgba(34,197,94,0.15)", icon: "◎" }
                    : severityConfig[alert.severity] || severityConfig.warning;

                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        background: "rgba(8,8,18,0.85)",
                        border: `1px solid ${s.border}`,
                        borderRadius: "14px", padding: "20px 24px",
                        backdropFilter: "blur(20px)",
                        position: "relative", overflow: "hidden",
                        display: "flex", gap: "16px",
                      }}
                    >
                      {/* Left accent */}
                      <div style={{
                        position: "absolute", left: 0, top: 0, bottom: 0,
                        width: "3px", background: s.color,
                        boxShadow: `0 0 12px ${s.glow}`,
                        borderRadius: "14px 0 0 14px",
                      }} />

                      {/* Icon */}
                      <div style={{
                        fontSize: "20px", color: s.color,
                        filter: `drop-shadow(0 0 6px ${s.color})`,
                        paddingLeft: "8px", flexShrink: 0,
                        marginTop: "2px",
                      }}>{s.icon}</div>

                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: "flex", alignItems: "center",
                          gap: "10px", marginBottom: "6px",
                          flexWrap: "wrap",
                        }}>
                          <span style={{
                            fontSize: "14px", fontWeight: "600",
                            color: "#f1f5f9", letterSpacing: "-0.2px",
                          }}>{alert.alert_type}</span>
                          <span style={{
                            fontSize: "10px", padding: "3px 10px",
                            borderRadius: "100px", background: s.bg,
                            border: `1px solid ${s.border}`,
                            color: s.color, fontWeight: "600",
                            letterSpacing: "0.5px",
                          }}>
                            {alert.resolved ? "RESOLVED" : alert.severity?.toUpperCase()}
                          </span>
                          <span style={{
                            fontSize: "11px", color: "#334155",
                            padding: "3px 10px",
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.04)",
                            borderRadius: "100px",
                          }}>{alert.service_name}</span>
                        </div>

                        <div style={{
                          fontSize: "13px", color: "#475569",
                          marginBottom: "12px", lineHeight: "1.6",
                        }}>{alert.description}</div>

                        {/* Confidence bar */}
                        {!alert.resolved && (
                          <div style={{ marginBottom: "14px" }}>
                            <div style={{
                              display: "flex", justifyContent: "space-between",
                              marginBottom: "5px",
                            }}>
                              <span style={{
                                fontSize: "10px", color: "#1e293b",
                                letterSpacing: "0.8px",
                              }}>AI CONFIDENCE</span>
                              <span style={{
                                fontSize: "10px", color: s.color,
                                fontWeight: "600",
                              }}>{alert.confidence?.toFixed(0)}%</span>
                            </div>
                            <div style={{
                              height: "3px",
                              background: "rgba(255,255,255,0.04)",
                              borderRadius: "100px", overflow: "hidden",
                            }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${alert.confidence}%` }}
                                transition={{ duration: 0.8, delay: i * 0.05 }}
                                style={{
                                  height: "100%",
                                  background: `linear-gradient(90deg, ${s.color}, ${s.color}80)`,
                                  borderRadius: "100px",
                                  boxShadow: `0 0 6px ${s.color}`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Buttons */}
                        {!alert.resolved && (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setFixModal(alert)}
                              style={{
                                padding: "6px 14px",
                                background: "rgba(124,58,237,0.08)",
                                border: "1px solid rgba(124,58,237,0.2)",
                                borderRadius: "7px", color: "#a78bfa",
                                fontSize: "12px", fontWeight: "500",
                                cursor: "pointer", fontFamily: "inherit",
                              }}
                            >AI fix →</motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleResolve(alert.id)}
                              style={{
                                padding: "6px 14px",
                                background: "rgba(255,255,255,0.02)",
                                border: "1px solid rgba(255,255,255,0.06)",
                                borderRadius: "7px", color: "#334155",
                                fontSize: "12px", cursor: "pointer",
                                fontFamily: "inherit",
                              }}
                            >Resolve</motion.button>
                          </div>
                        )}
                      </div>

                      {/* Time */}
                      <div style={{
                        fontSize: "11px", color: "#1e293b",
                        whiteSpace: "nowrap", flexShrink: 0,
                      }}>{timeAgo(alert.timestamp)}</div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Fix Modal */}
      <AnimatePresence>
        {fixModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFixModal(null)}
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
                maxWidth: "460px", width: "90%",
                boxShadow: "0 0 80px rgba(124,58,237,0.1)",
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: 0,
                left: "15%", right: "15%", height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.6), transparent)",
              }} />

              <div style={{
                fontSize: "11px", color: "#a78bfa",
                letterSpacing: "1px", fontWeight: "600", marginBottom: "8px",
              }}>AI RECOMMENDATION</div>

              <div style={{
                fontSize: "18px", fontWeight: "700",
                color: "#f8fafc", letterSpacing: "-0.5px", marginBottom: "6px",
              }}>{fixModal.alert_type}</div>

              <div style={{
                fontSize: "12px", color: "#334155", marginBottom: "20px",
              }}>{fixModal.service_name}</div>

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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleResolve(fixModal.id);
                    setFixModal(null);
                  }}
                  style={{
                    flex: 1, padding: "11px",
                    background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                    border: "none", borderRadius: "10px",
                    color: "#fff", fontSize: "13px", fontWeight: "600",
                    cursor: "pointer", fontFamily: "inherit",
                    boxShadow: "0 0 20px rgba(124,58,237,0.2)",
                  }}
                >Apply fix →</motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFixModal(null)}
                  style={{
                    padding: "11px 20px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "10px", color: "#334155",
                    fontSize: "13px", cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >Dismiss</motion.button>
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

export default Alerts;