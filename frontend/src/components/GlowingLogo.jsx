import { motion } from "framer-motion";

const GlowingLogo = ({ size = "small", showText = true }) => {
  const isLarge = size === "large";
  
  const containerSize = isLarge ? 80 : 36;
  const ring1Size = isLarge ? 120 : 54;
  const ring2Size = isLarge ? 140 : 64;
  const innerBoxSize = isLarge ? 36 : 16;
  const fontSize = isLarge ? "36px" : "18px";
  const gap = isLarge ? "32px" : "16px";
  
  return (
    <div style={{ display: "flex", alignItems: "center", gap: gap, cursor: "pointer" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: ring2Size, height: ring2Size }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute", width: ring1Size, height: ring1Size,
            borderRadius: "50%",
            border: "1px dashed rgba(124,58,237,0.5)",
            boxShadow: "0 0 20px rgba(124,58,237,0.2)"
          }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute", width: ring2Size, height: ring2Size,
            borderRadius: "50%",
            border: "2px solid transparent",
            borderTopColor: "rgba(56,189,248,0.8)",
            borderBottomColor: "rgba(56,189,248,0.8)",
            opacity: 0.7
          }}
        />
        <motion.div
          style={{
            width: containerSize, height: containerSize,
            borderRadius: isLarge ? "20px" : "10px",
            background: "linear-gradient(135deg, #7c3aed, #0ea5e9)",
            display: "flex", alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 ${isLarge ? '60px' : '20px'} rgba(124,58,237,0.8), inset 0 0 ${isLarge ? '20px' : '8px'} rgba(255,255,255,0.4)`,
            position: "relative",
            zIndex: 2
          }}
        >
          <div style={{
            width: innerBoxSize, height: innerBoxSize,
            borderRadius: isLarge ? "8px" : "4px",
            border: `${isLarge ? '4px' : '2px'} solid #fff`,
            boxShadow: `0 0 ${isLarge ? '15px' : '5px'} rgba(255,255,255,0.8)`
          }} />
        </motion.div>
      </div>
      
      {showText && (
        <div style={{
          fontSize: fontSize, fontWeight: "900",
          letterSpacing: "-0.5px",
          background: "linear-gradient(to right, #fff, #a78bfa, #38bdf8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontFamily: "'Inter', system-ui, sans-serif",
          filter: "drop-shadow(0 0 10px rgba(167,139,250,0.5))"
        }}>
          SysWatch AI
        </div>
      )}
    </div>
  );
};

export default GlowingLogo;
