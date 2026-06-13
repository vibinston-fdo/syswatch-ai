import { motion } from "framer-motion";

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
  resolved: {
    color: "#4ade80",
    glow: "rgba(74,222,128,0.15)",
    bg: "rgba(34,197,94,0.06)",
    border: "rgba(34,197,94,0.15)",
    icon: "⊙",
  },
};

const AlertItem = ({ alert, onResolve, onFix, index }) => {
  const s = severityConfig[alert.resolved ? "resolved" : alert.severity]
    || severityConfig.warning;

  const timeAgo = (timestamp) => {
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.08 }}
      style={{
        background: "rgba(8,8,18,0.85)",
        border: `1px solid ${s.border}`,
        borderRadius: "14px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "flex-start",
        gap: "14px",
        backdropFilter: "blur(20px)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Left glow */}
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

      {/* Icon */}
      <div style={{
        fontSize: "18px",
        color: s.color,
        filter: `drop-shadow(0 0 6px ${s.color})`,
        marginTop: "1px",
        flexShrink: 0,
        paddingLeft: "8px",
      }}>{s.icon}</div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "4px",
        }}>
          <span style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#f1f5f9",
            letterSpacing: "-0.2px",
          }}>{alert.alert_type}</span>
          <span style={{
            fontSize: "10px",
            padding: "2px 8px",
            borderRadius: "100px",
            background: s.bg,
            border: `1px solid ${s.border}`,
            color: s.color,
            fontWeight: "600",
            letterSpacing: "0.5px",
          }}>{alert.resolved ? "RESOLVED" : alert.severity?.toUpperCase()}</span>
        </div>

        <div style={{
          fontSize: "12px",
          color: "#334155",
          marginBottom: "6px",
          lineHeight: "1.5",
        }}>
          {alert.service_name} — {alert.description}
        </div>

        {/* Confidence bar */}
        {!alert.resolved && (
          <div style={{ marginBottom: "10px" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "4px",
            }}>
              <span style={{
                fontSize: "10px",
                color: "#1e293b",
                letterSpacing: "0.5px",
              }}>AI CONFIDENCE</span>
              <span style={{
                fontSize: "10px",
                color: s.color,
                fontWeight: "600",
              }}>{alert.confidence?.toFixed(0)}%</span>
            </div>
            <div style={{
              height: "3px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "100px",
              overflow: "hidden",
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${alert.confidence}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                style={{
                  height: "100%",
                  background: `linear-gradient(90deg, ${s.color}, ${s.color}99)`,
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
              onClick={() => onFix && onFix(alert)}
              style={{
                padding: "5px 12px",
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.2)",
                borderRadius: "6px",
                color: "#a78bfa",
                fontSize: "11px",
                fontWeight: "500",
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.2px",
              }}
            >AI fix →</motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onResolve && onResolve(alert.id)}
              style={{
                padding: "5px 12px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "6px",
                color: "#334155",
                fontSize: "11px",
                fontWeight: "500",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >Resolve</motion.button>
          </div>
        )}
      </div>

      {/* Time */}
      <div style={{
        fontSize: "11px",
        color: "#1e293b",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}>{timeAgo(alert.timestamp)}</div>
    </motion.div>
  );
};

export default AlertItem;