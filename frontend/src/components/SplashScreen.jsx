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
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{
            position: "fixed", inset: 0,
            background: "#05050a", // Slightly lighter dark background
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            flexDirection: "column",
            gap: "32px",
            overflow: "hidden"
          }}
        >
          {/* Deep space tech grid */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundSize: "40px 40px",
            backgroundImage: "linear-gradient(to right, rgba(124, 58, 237, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(124, 58, 237, 0.05) 1px, transparent 1px)",
            pointerEvents: "none",
            transform: "perspective(500px) rotateX(60deg) translateY(-100px) scale(3)",
            animation: "gridMove 10s linear infinite",
          }} />

          {/* Central massive glow */}
          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: "60vw", height: "60vw",
              background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, rgba(56,189,248,0.05) 40%, transparent 70%)",
              pointerEvents: "none",
              filter: "blur(40px)"
            }}
          />

          {/* Logo container with spinning rings */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{
                position: "absolute", width: "120px", height: "120px",
                borderRadius: "50%",
                border: "1px dashed rgba(124,58,237,0.5)",
                boxShadow: "0 0 20px rgba(124,58,237,0.2)"
              }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              style={{
                position: "absolute", width: "140px", height: "140px",
                borderRadius: "50%",
                border: "2px solid transparent",
                borderTopColor: "rgba(56,189,248,0.8)",
                borderBottomColor: "rgba(56,189,248,0.8)",
                opacity: 0.7
              }}
            />
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, type: "spring", bounce: 0.5 }}
              style={{
                width: "80px", height: "80px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #7c3aed, #0ea5e9)",
                display: "flex", alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 60px rgba(124,58,237,0.8), inset 0 0 20px rgba(255,255,255,0.4)",
                position: "relative",
                zIndex: 2
              }}
            >
              <div style={{
                width: "36px", height: "36px",
                borderRadius: "8px",
                border: "4px solid #fff",
                boxShadow: "0 0 15px rgba(255,255,255,0.8)"
              }} />
            </motion.div>
          </div>

          {/* Text block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{ textAlign: "center", zIndex: 2 }}
          >
            <div style={{
              fontSize: "36px", fontWeight: "900",
              letterSpacing: "-1.5px", marginBottom: "12px",
              background: "linear-gradient(to right, #fff, #a78bfa, #38bdf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "'Inter', system-ui, sans-serif",
              filter: "drop-shadow(0 0 10px rgba(167,139,250,0.5))"
            }}>SysWatch AI</div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                fontSize: "14px", color: "#38bdf8",
                fontFamily: "'Fira Code', monospace",
                letterSpacing: "2px",
                textTransform: "uppercase"
              }}
            >
              Initializing Neural Mesh...
            </motion.div>
          </motion.div>

          {/* Progress Bar container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              width: "240px", height: "4px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "10px",
              overflow: "hidden",
              position: "relative",
              zIndex: 2,
              boxShadow: "inset 0 0 5px rgba(0,0,0,0.5)"
            }}
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }}
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #7c3aed, #38bdf8, #4ade80)",
                borderRadius: "10px",
                boxShadow: "0 0 15px #38bdf8",
              }}
            />
          </motion.div>

          {/* Version */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            style={{
              position: "absolute", bottom: "40px",
              fontSize: "12px", color: "#64748b",
              fontFamily: "'Fira Code', monospace",
              letterSpacing: "1px",
              zIndex: 2
            }}
          >
            v1.0.0 // SECURE CONNECTION
          </motion.div>

          <style>{`
            @keyframes gridMove {
              0% { background-position: 0 0; }
              100% { background-position: 0 40px; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;