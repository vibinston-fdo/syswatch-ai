import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const SplashScreen = ({ onComplete }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500);
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "fixed", inset: 0,
            background: "#030308",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Background glow */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
            style={{
              width: "64px", height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #7c3aed, #6366f1)",
              display: "flex", alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(124,58,237,0.5)",
            }}
          >
            <div style={{
              width: "28px", height: "28px",
              borderRadius: "6px",
              border: "3px solid rgba(255,255,255,0.9)",
            }} />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ textAlign: "center" }}
          >
            <div style={{
              fontSize: "24px", fontWeight: "800",
              letterSpacing: "-1px", marginBottom: "8px",
              background: "linear-gradient(135deg, #f8fafc, #a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>SysWatch AI</div>
            <div style={{
              fontSize: "13px", color: "#334155",
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>Initializing system monitor...</div>
          </motion.div>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              width: "200px", height: "2px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "100px",
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #7c3aed, #38bdf8)",
                borderRadius: "100px",
                boxShadow: "0 0 10px rgba(124,58,237,0.5)",
              }}
            />
          </motion.div>

          {/* Version */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{
              position: "absolute", bottom: "32px",
              fontSize: "11px", color: "#1e293b",
              fontFamily: "'Inter', system-ui, sans-serif",
              letterSpacing: "0.5px",
            }}
          >v1.0.0 • Built with FastAPI + React</motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;