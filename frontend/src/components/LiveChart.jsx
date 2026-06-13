import { motion } from "framer-motion";
import {
   BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from "recharts";

const CustomTooltip = ({ active, payload, label, color }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(8,8,18,0.95)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "10px",
        padding: "10px 14px",
        fontFamily: "'Inter', system-ui, sans-serif",
        backdropFilter: "blur(20px)",
      }}>
        <div style={{
          fontSize: "11px",
          color: "#334155",
          marginBottom: "4px",
          letterSpacing: "0.3px",
        }}>{label}</div>
        <div style={{
          fontSize: "16px",
          fontWeight: "700",
          color: color || "#a78bfa",
          letterSpacing: "-0.5px",
        }}>{payload[0].value}{payload[0].unit}</div>
      </div>
    );
  }
  return null;
};

const LiveChart = ({ title, data, dataKey, color, unit, type, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.7 }}
      style={{
        background: "rgba(8,8,18,0.85)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "16px",
        padding: "24px",
        backdropFilter: "blur(20px)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Top shimmer */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "20%",
        right: "20%",
        height: "1px",
        background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
      }} />

      {/* Glow */}
      <div style={{
        position: "absolute",
        top: "-40px",
        right: "-40px",
        width: "150px",
        height: "150px",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px",
      }}>
        <div style={{
          fontSize: "13px",
          fontWeight: "500",
          color: "#475569",
          letterSpacing: "0.2px",
        }}>{title}</div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "3px 10px",
          borderRadius: "100px",
          background: `${color}10`,
          border: `1px solid ${color}20`,
        }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 4px ${color}`,
            }}
          />
          <span style={{
            fontSize: "10px",
            color: color,
            fontWeight: "500",
            letterSpacing: "0.5px",
          }}>LIVE</span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={160}>
        {type === "bar" ? (
          <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.03)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "#1e293b", fontFamily: "Inter" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#1e293b", fontFamily: "Inter" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip color={color} />}
              cursor={{ fill: "rgba(255,255,255,0.02)" }}
            />
            <Bar
              dataKey={dataKey}
              fill={color}
              radius={[4, 4, 0, 0]}
              unit={unit}
            />
          </BarChart>
        ) : (
          <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.03)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "#1e293b", fontFamily: "Inter" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#1e293b", fontFamily: "Inter" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip color={color} />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#grad-${dataKey})`}
              dot={false}
              activeDot={{
                r: 4,
                fill: color,
                stroke: "rgba(8,8,18,0.9)",
                strokeWidth: 2,
              }}
              unit={unit}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
};

export default LiveChart;