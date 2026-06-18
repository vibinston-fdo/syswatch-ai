import { motion } from "framer-motion";

const statusConfig = {
  healthy: {
    color: "#4ade80",
    glow: "rgba(74,222,128,0.2)",
    bg: "rgba(34,197,94,0.06)",
    border: "rgba(34,197,94,0.15)",
    label: "Healthy",
  },
  warning: {
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.2)",
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.15)",
    label: "Warning",
  },
  critical: {
    color: "#f87171",
    glow: "rgba(248,113,113,0.2)",
    bg: "rgba(239,68,68,0.06)",
    border: "rgba(239,68,68,0.15)",
    label: "Critical",
  },
};

const ServiceCard = ({ name, status, cpu, memory, latency, index }) => {
  const s = statusConfig[status] || statusConfig.healthy;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.6 }}
      whileHover={{ scale: 1.01 }}
      style={{
      background: `linear-gradient(135deg, rgba(8,8,18,0.9), rgba(8,8,18,0.7))`,
      border: `1px solid ${s.border}`,
      borderRadius: "14px",
      padding: "18px 20px",
      boxShadow: `0 4px 24px ${s.glow}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backdropFilter: "blur(20px)",
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Left glow based on status */}
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: "3px",
        background: s.color,
        boxShadow: `0 0 12px ${s.glow}`,
        borderRadius: "14px 0 0 14px",
      }} />

      {/* Service name + status */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        paddingLeft: "12px",
      }}>
        {/* Dot */}
        <motion.div
          animate={status === "critical"
            ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }
            : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: s.color,
            boxShadow: `0 0 8px ${s.glow}`,
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{
            fontSize: "13px",
            fontWeight: "500",
            color: "#f1f5f9",
            letterSpacing: "-0.2px",
          }}>{name}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "24px",
      }}>
        {[
          { label: "CPU", value: `${cpu?.toFixed(1)}%` },
          { label: "MEM", value: `${memory?.toFixed(0)}MB` },
          { label: "LAT", value: `${latency?.toFixed(0)}ms` },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: "right" }}>
            <div style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#f1f5f9",
              letterSpacing: "-0.3px",
            }}>{stat.value}</div>
            <div style={{
              fontSize: "10px",
              color: "#334155",
              letterSpacing: "0.5px",
            }}>{stat.label}</div>
          </div>
        ))}

        {/* Status badge */}
        <div style={{
          padding: "4px 12px",
          borderRadius: "100px",
          background: s.bg,
          border: `1px solid ${s.border}`,
          fontSize: "11px",
          fontWeight: "600",
          color: s.color,
          letterSpacing: "0.3px",
          minWidth: "70px",
          textAlign: "center",
        }}>{s.label}</div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;