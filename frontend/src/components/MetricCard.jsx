import { motion } from "framer-motion";

const MetricCard = ({ label, value, sub, subColor, icon, glowColor, index }) => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="tilt-card neon-border"
      style={{
        background: "rgba(8,8,18,0.85)",
        borderRadius: "16px",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Animated corner glow */}
      <motion.div
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "-40px", right: "-40px",
          width: "120px", height: "120px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glowColor || "rgba(124,58,237,0.15)"} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Top shimmer line */}
      <div style={{
        position: "absolute", top: 0,
        left: "20%", right: "20%", height: "1px",
        background: `linear-gradient(90deg, transparent, ${glowColor || "rgba(124,58,237,0.5)"}, transparent)`,
      }} />

      {/* Icon with float animation */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
        style={{
          fontSize: "22px", marginBottom: "16px",
          filter: `drop-shadow(0 0 8px ${glowColor || "rgba(124,58,237,0.5)"})`,
        }}
      >{icon}</motion.div>

      {/* Value */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 + 0.2, type: "spring", bounce: 0.4 }}
        style={{
          fontSize: "32px",
          fontWeight: "700",
          color: "#f8fafc",
          letterSpacing: "-1.5px",
          lineHeight: 1,
          marginBottom: "8px",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >{value}</motion.div>

      {/* Label */}
      <div style={{
        fontSize: "11px", color: "#334155",
        letterSpacing: "1px", marginBottom: "6px",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>{label}</div>

      {/* Sub */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.5 }}
        style={{
          fontSize: "11px",
          color: subColor || "#4ade80",
          fontWeight: "500",
          fontFamily: "'Inter', system-ui, sans-serif",
          display: "flex", alignItems: "center", gap: "4px",
        }}
      >
        <div style={{
          width: "4px", height: "4px", borderRadius: "50%",
          background: subColor || "#4ade80",
          boxShadow: `0 0 6px ${subColor || "#4ade80"}`,
        }} />
        {sub}
      </motion.div>
    </motion.div>
  );
};

export default MetricCard;