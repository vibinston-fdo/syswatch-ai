import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Terminal, X } from "lucide-react";

const TerminalLog = ({ logs, onClose }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel"
      style={{
        width: "100%",
        height: "250px",
        display: "flex",
        flexDirection: "column",
        background: "rgba(5,5,10,0.8)",
        border: "1px solid rgba(124,58,237,0.3)",
        position: "relative",
      }}
    >
      {/* Terminal Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        background: "rgba(124,58,237,0.1)",
        borderBottom: "1px solid rgba(124,58,237,0.2)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Terminal size={14} color="#a78bfa" />
          <span className="font-sans" style={{ fontSize: "11px", color: "#a78bfa", fontWeight: "600", letterSpacing: "1px" }}>SYSTEM TERMINAL</span>
        </div>
        {onClose && (
          <X size={14} color="#64748b" style={{ cursor: "pointer" }} onClick={onClose} />
        )}
      </div>

      {/* Terminal Body */}
      <div ref={containerRef} className="font-mono" style={{
        padding: "16px",
        flex: 1,
        overflowY: "auto",
        fontSize: "12px",
        color: "#94a3b8",
        lineHeight: "1.6",
        display: "flex",
        flexDirection: "column",
        gap: "6px"
      }}>
        {logs.map((log, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: "flex", gap: "10px" }}
          >
            <span style={{ color: "#475569" }}>[{log.time}]</span>
            <span style={{ color: log.color || "#cbd5e1" }}>{log.message}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TerminalLog;
