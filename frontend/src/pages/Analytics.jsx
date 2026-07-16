import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Navbar from "../components/Navbar";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const CustomTooltip = ({ active, payload, label, color }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(8,8,18,0.95)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "10px", padding: "10px 14px",
        fontFamily: "'Inter', system-ui, sans-serif",
        backdropFilter: "blur(20px)",
      }}>
        <div style={{ fontSize: "11px", color: "#334155", marginBottom: "4px" }}>
          {label}
        </div>
        <div style={{
          fontSize: "16px", fontWeight: "700",
          color: color || "#a78bfa", letterSpacing: "-0.5px",
        }}>{payload[0].value}</div>
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [, setLoading] = useState(true);
  const fetchData = async () => {
    try {
      const [statsRes, servicesRes] = await Promise.all([
        axios.get("http://localhost:8000/api/alerts/stats"),
        axios.get("http://localhost:8000/api/services/metrics/latest"),
      ]);
      setStats(statsRes.data);
      setServices(servicesRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Build chart data
  const serviceChartData = services.map(s => ({
    name: s.service_name.replace(" Service", ""),
    cpu: parseFloat(s.cpu?.toFixed(1)),
    memory: parseFloat((s.memory / 100)?.toFixed(1)),
    latency: parseFloat(s.latency?.toFixed(0)),
  }));

  const pieData = stats?.by_service
    ? Object.entries(stats.by_service).map(([name, value]) => ({
        name: name.replace(" Service", ""),
        value,
      }))
    : [];

  const PIE_COLORS = ["#f87171", "#fbbf24", "#818cf8", "#38bdf8", "#4ade80"];

  const weeklyData = [
    { day: "Mon", alerts: 1 },
    { day: "Tue", alerts: 3 },
    { day: "Wed", alerts: 2 },
    { day: "Thu", alerts: 4 },
    { day: "Fri", alerts: 2 },
    { day: "Sat", alerts: 1 },
    { day: "Sun", alerts: stats?.active_alerts || 0 },
  ];

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
              color: "#f8fafc", letterSpacing: "-1px", margin: "0 0 6px",
            }}>Analytics</h1>
            <p style={{ fontSize: "13px", color: "#334155", margin: 0 }}>
              System performance insights and trends
            </p>
          </motion.div>

          {/* Stats row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px", marginBottom: "24px",
          }}>
            {[
              {
                label: "TOTAL ALERTS",
                value: stats?.total_alerts || 0,
                color: "#818cf8",
                sub: "All time",
              },
              {
                label: "ACTIVE NOW",
                value: stats?.active_alerts || 0,
                color: "#f87171",
                sub: "Need attention",
              },
              {
                label: "RESOLVED",
                value: stats?.resolved_alerts || 0,
                color: "#4ade80",
                sub: "Fixed issues",
              },
              {
                label: "MOST AFFECTED",
                value: stats?.most_affected
                  ? stats.most_affected.replace(" Service", "")
                  : "—",
                color: "#fbbf24",
                sub: "Service",
                small: true,
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
                  fontSize: stat.small ? "20px" : "32px",
                  fontWeight: "700", color: stat.color,
                  letterSpacing: "-1px",
                  textShadow: `0 0 20px ${stat.color}40`,
                }}>{stat.value}</div>
                <div style={{
                  fontSize: "11px", color: "#1e293b",
                  marginTop: "4px",
                }}>{stat.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* Charts row 1 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px", marginBottom: "16px",
          }}>

            {/* CPU Chart */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                background: "rgba(8,8,18,0.85)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "16px", padding: "24px",
                backdropFilter: "blur(20px)",
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: 0,
                left: "20%", right: "20%", height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(129,140,248,0.4), transparent)",
              }} />
              <div style={{
                fontSize: "13px", fontWeight: "500",
                color: "#475569", marginBottom: "20px",
              }}>CPU usage by service</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={serviceChartData}
                  margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name"
                    tick={{ fontSize: 10, fill: "#1e293b", fontFamily: "Inter" }}
                    axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#1e293b", fontFamily: "Inter" }}
                    axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip color="#818cf8" />}
                    cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                  <Bar dataKey="cpu" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Weekly alerts */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: "rgba(8,8,18,0.85)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "16px", padding: "24px",
                backdropFilter: "blur(20px)",
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: 0,
                left: "20%", right: "20%", height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(248,113,113,0.4), transparent)",
              }} />
              <div style={{
                fontSize: "13px", fontWeight: "500",
                color: "#475569", marginBottom: "20px",
              }}>Weekly anomaly trend</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weeklyData}
                  margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="day"
                    tick={{ fontSize: 10, fill: "#1e293b", fontFamily: "Inter" }}
                    axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#1e293b", fontFamily: "Inter" }}
                    axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip color="#f87171" />} />
                  <Area type="monotone" dataKey="alerts"
                    stroke="#f87171" strokeWidth={1.5}
                    fill="url(#alertGrad)" dot={false}
                    activeDot={{ r: 4, fill: "#f87171" }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Charts row 2 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}>

            {/* Latency chart */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                background: "rgba(8,8,18,0.85)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "16px", padding: "24px",
                backdropFilter: "blur(20px)",
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: 0,
                left: "20%", right: "20%", height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.4), transparent)",
              }} />
              <div style={{
                fontSize: "13px", fontWeight: "500",
                color: "#475569", marginBottom: "20px",
              }}>Latency by service (ms)</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={serviceChartData}
                  margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name"
                    tick={{ fontSize: 10, fill: "#1e293b", fontFamily: "Inter" }}
                    axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#1e293b", fontFamily: "Inter" }}
                    axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip color="#38bdf8" />}
                    cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                  <Bar dataKey="latency" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Pie chart */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                background: "rgba(8,8,18,0.85)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "16px", padding: "24px",
                backdropFilter: "blur(20px)",
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: 0,
                left: "20%", right: "20%", height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)",
              }} />
              <div style={{
                fontSize: "13px", fontWeight: "500",
                color: "#475569", marginBottom: "20px",
              }}>Alerts by service</div>

              {pieData.length === 0 ? (
                <div style={{
                  height: "200px", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  flexDirection: "column", gap: "12px",
                }}>
                  <div style={{ fontSize: "32px" }}>◎</div>
                  <div style={{ fontSize: "12px", color: "#1e293b" }}>
                    No alert data yet
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={80}
                        paddingAngle={3} dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "rgba(8,8,18,0.95)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: "10px",
                          fontFamily: "Inter",
                          fontSize: "12px",
                          color: "#f1f5f9",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div style={{
                    display: "flex", flexDirection: "column", gap: "10px",
                  }}>
                    {pieData.map((entry, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: "8px",
                      }}>
                        <div style={{
                          width: "8px", height: "8px", borderRadius: "2px",
                          background: PIE_COLORS[i % PIE_COLORS.length],
                          flexShrink: 0,
                        }} />
                        <span style={{ fontSize: "12px", color: "#475569" }}>
                          {entry.name}
                        </span>
                        <span style={{
                          fontSize: "12px", fontWeight: "600",
                          color: PIE_COLORS[i % PIE_COLORS.length],
                          marginLeft: "auto",
                        }}>{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
};

export default Analytics;