import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../api";
import Sidebar from "../components/Sidebar";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const CustomTooltip = ({ active, payload, label, color, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel" style={{ padding: "10px 14px", fontFamily: "'Inter', system-ui", minWidth: "100px" }}>
        <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>{label}</div>
        <div className="font-mono" style={{ fontSize: "18px", fontWeight: "700", color: color || "#a78bfa" }}>
          {payload[0].value}{unit || ""}
        </div>
      </div>
    );
  }
  return null;
};

const ChartPanel = ({ title, accentColor, children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="glass-panel" style={{ padding: "24px", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: "1px", background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)` }} />
    <div style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc", marginBottom: "6px" }}>{title}</div>
    {children}
  </motion.div>
);

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, servicesRes] = await Promise.all([
        api.get("/api/alerts/stats"),
        api.get("/api/services/metrics/latest"),
      ]);
      setStats(statsRes.data);
      setServices(servicesRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const serviceChartData = services.map(s => ({
    name: s.service_name.replace(" Service", ""),
    cpu: parseFloat(s.cpu?.toFixed(1)),
    memory: parseFloat(s.memory?.toFixed(0)),
    latency: parseFloat(s.latency?.toFixed(0)),
  }));

  const pieData = stats?.by_service
    ? Object.entries(stats.by_service).map(([name, value]) => ({ name: name.replace(" Service", ""), value }))
    : [];

  const PIE_COLORS = ["#f87171", "#fbbf24", "#818cf8", "#38bdf8", "#4ade80"];
  const weeklyData = [
    { day: "Mon", alerts: 1 }, { day: "Tue", alerts: 3 }, { day: "Wed", alerts: 2 },
    { day: "Thu", alerts: 4 }, { day: "Fri", alerts: 2 }, { day: "Sat", alerts: 1 },
    { day: "Sun", alerts: stats?.active_alerts || 0 },
  ];

  const axisStyle = { fontSize: 10, fill: "#475569", fontFamily: "Fira Code, monospace" };

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`, backgroundSize: "64px 64px", pointerEvents: "none", zIndex: 0 }} />

      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ position: "relative", zIndex: 1, padding: "32px 40px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600", letterSpacing: "1px" }}>PLATFORM / </span>
            <span style={{ fontSize: "12px", color: "#f8fafc", fontWeight: "600", letterSpacing: "1px" }}>ANALYTICS</span>
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: "700", letterSpacing: "-1px", margin: "0 0 8px", color: "#f8fafc" }}>Analytics</h1>
          <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>System performance insights and trends</p>
        </motion.div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
          {[
            { label: "TOTAL ALERTS", value: stats?.total_alerts || 0, color: "#818cf8", sub: "All time" },
            { label: "ACTIVE NOW", value: stats?.active_alerts || 0, color: "#f87171", sub: "Needs attention" },
            { label: "RESOLVED", value: stats?.resolved_alerts || 0, color: "#4ade80", sub: "Fixed" },
            { label: "MOST AFFECTED", value: stats?.most_affected?.replace(" Service", "") || "—", color: "#fbbf24", sub: "Service", small: true },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="glass-panel" style={{ padding: "20px 24px" }}>
              <div style={{ fontSize: "11px", color: "#64748b", letterSpacing: "1px", marginBottom: "8px" }}>{stat.label}</div>
              <div className="font-mono" style={{ fontSize: stat.small ? "20px" : "32px", fontWeight: "700", color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>{stat.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
          <ChartPanel title="CPU usage by service (%)" accentColor="#818cf8" delay={0.2}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={serviceChartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={1} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip color="#818cf8" unit="%" />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="cpu" fill="url(#cpuGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel title="Weekly anomaly trend" accentColor="#f87171" delay={0.3}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip color="#f87171" unit=" alerts" />} />
                <Area type="monotone" dataKey="alerts" stroke="#f87171" strokeWidth={2} fill="url(#alertGrad)" dot={false} activeDot={{ r: 4, fill: "#f87171", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartPanel>
        </div>

        {/* Charts Row 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <ChartPanel title="Latency by service (ms)" accentColor="#38bdf8" delay={0.4}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={serviceChartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="latGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={1} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip color="#38bdf8" unit=" ms" />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="latency" fill="url(#latGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel title="Alerts distribution by service" accentColor="#fbbf24" delay={0.5}>
            {pieData.length === 0 ? (
              <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }}>
                <div className="font-mono" style={{ fontSize: "12px", color: "#64748b" }}>No alert data yet</div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "rgba(10,10,16,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", fontFamily: "Fira Code", fontSize: "12px", color: "#f1f5f9" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {pieData.map((entry, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: "#64748b" }}>{entry.name}</span>
                      <span className="font-mono" style={{ fontSize: "12px", fontWeight: "700", color: PIE_COLORS[i % PIE_COLORS.length], marginLeft: "auto" }}>{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartPanel>
        </div>
      </div>
    </div>
  );
};

export default Analytics;