import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";
import NetworkBackground from "../components/NetworkBackground";
import GlowingLogo from "../components/GlowingLogo";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true); setError("");
    try {
      const res = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      const message = err.response?.data?.detail || err.message || "Invalid credentials. Please try again.";
      setError(message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      position: "relative",
      overflowX: "hidden",
    }}>
      <NetworkBackground />
      {/* ── LEFT PANEL ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: isMobile ? "32px 24px" : "44px 64px",
          position: "relative",
          zIndex: 1,
          borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.03)",
          borderBottom: isMobile ? "1px solid rgba(255,255,255,0.03)" : "none",
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate("/")}
        >
          <GlowingLogo size="small" />
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
        >
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.65 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "6px 16px", borderRadius: "100px",
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.15)", marginBottom: "32px",
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "#22c55e", boxShadow: "0 0 8px #22c55e",
              }}
            />
            <span style={{
              fontSize: "11px", color: "#4ade80",
              letterSpacing: "1px", fontWeight: "500",
            }}>ALL SYSTEMS OPERATIONAL</span>
          </motion.div>

          {/* Heading */}
          <h1 style={{
          fontSize: "clamp(32px, 4vw, 60px)",
          fontWeight: "800",
          lineHeight: "1.04",
          letterSpacing: "-2px",
          margin: "0 0 24px",
          maxWidth: "560px",
          fontFamily: "'Syne', sans-serif",
          }}>
            <span style={{ color: "#f8fafc" }}>The future of</span>
            <br />
            <span style={{
              background: "linear-gradient(90deg, #a78bfa 0%, #818cf8 35%, #38bdf8 70%, #34d399 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>infrastructure</span>
            <br />
            <span style={{ color: "#f8fafc" }}>intelligence.</span>
          </h1>

          <p style={{
            fontSize: "15px", color: "#334155",
            lineHeight: "1.8", margin: "0 0 52px", maxWidth: "380px",
          }}>
            AI-powered anomaly detection catches issues before
            users notice. Self-healing suggestions keep systems
            running at peak performance.
          </p>

          {/* Stats */}
          <div style={{ display: "flex" }}>
            {[
              { num: "99.9%", label: "Uptime SLA", color: "#4ade80" },
              { num: "< 1s", label: "Detection", color: "#818cf8" },
              { num: "5×", label: "Services", color: "#38bdf8" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 + i * 0.1 }}
                style={{
                  paddingRight: i < 2 ? "36px" : 0,
                  marginRight: i < 2 ? "36px" : 0,
                  borderRight: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <div style={{
                  fontSize: "28px", fontWeight: "700",
                  color: s.color, letterSpacing: "-1px",
                  textShadow: `0 0 24px ${s.color}50`,
                }}>{s.num}</div>
                <div style={{
                  fontSize: "11px", color: "#1e293b",
                  marginTop: "4px", letterSpacing: "0.4px",
                }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          style={{
            padding: "20px 24px",
            background: "rgba(255,255,255,0.015)",
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: "14px", maxWidth: "420px",
          }}
        >
          <p style={{
            fontSize: "13px", color: "#334155",
            lineHeight: "1.7", margin: "0 0 16px", fontStyle: "italic",
          }}>
            "SysWatch detected a memory leak in our payment service
            8 minutes before it would have caused a major outage."
          </p>

          {/* Animated ring avatar */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "4px" }}>
            <div style={{ position: "relative", width: "36px", height: "36px" }}>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute", inset: "-4px", borderRadius: "50%",
                  border: "1px solid rgba(167,139,250,0.6)",
                }}
              />
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                style={{
                  position: "absolute", inset: "-2px", borderRadius: "50%",
                  border: "1px solid rgba(56,189,248,0.4)",
                }}
              />
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #38bdf8)",
                boxShadow: "0 0 16px rgba(124,58,237,0.5)",
              }} />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── RIGHT PANEL ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          width: isMobile ? "100%" : "500px",
          display: "flex", alignItems: "center",
          justifyContent: "center", padding: isMobile ? "32px 24px" : "44px",
          position: "relative", zIndex: 1,
        }}
      >
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.9 }}
            style={{
              background: "rgba(8,8,18,0.85)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "22px", padding: "38px",
              backdropFilter: "blur(32px)",
              boxShadow: `
                0 0 0 1px rgba(255,255,255,0.02),
                0 24px 48px rgba(0,0,0,0.5),
                0 0 80px rgba(124,58,237,0.06)
              `,
              position: "relative", overflow: "hidden",
            }}
          >
            {/* Top shimmer */}
            <div style={{
              position: "absolute", top: 0, left: "15%", right: "15%", height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.6), rgba(56,189,248,0.4), transparent)",
            }} />

            {/* Inner glow */}
            <div style={{
              position: "absolute", top: "-60px", right: "-60px",
              width: "200px", height: "200px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{ marginBottom: "28px", position: "relative" }}>
              <h2 style={{
                fontSize: "22px", fontWeight: "700",
                color: "#f8fafc", letterSpacing: "-0.6px", margin: "0 0 6px",
              }}>Welcome</h2>
              <p style={{ fontSize: "13px", color: "#334155", margin: 0 }}>
                Sign in to your dashboard
              </p>
            </div>

            {/* Email */}
            <div style={{ marginBottom: "14px", position: "relative" }}>
              <label style={{
                fontSize: "10px", fontWeight: "600",
                color: focused === "email" ? "#a78bfa" : "#334155",
                display: "block", marginBottom: "8px",
                letterSpacing: "1px", transition: "color 0.2s",
              }}>EMAIL OR USERNAME</label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="name@company.com or username"
                style={{
                  width: "100%", padding: "12px 16px",
                  background: focused === "email"
                    ? "rgba(124,58,237,0.06)" : "rgba(255,255,255,0.025)",
                  border: focused === "email"
                    ? "1px solid rgba(167,139,250,0.5)" : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "10px", color: "#f1f5f9",
                  fontSize: "13px", outline: "none",
                  boxSizing: "border-box", transition: "all 0.2s",
                  fontFamily: "inherit",
                  boxShadow: focused === "email"
                    ? "0 0 0 3px rgba(124,58,237,0.08)" : "none",
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "20px", position: "relative" }}>
              <label style={{
                fontSize: "10px", fontWeight: "600",
                color: focused === "password" ? "#a78bfa" : "#334155",
                display: "block", marginBottom: "8px",
                letterSpacing: "1px", transition: "color 0.2s",
              }}>PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="••••••••••••"
                style={{
                  width: "100%", padding: "12px 16px",
                  background: focused === "password"
                    ? "rgba(124,58,237,0.06)" : "rgba(255,255,255,0.025)",
                  border: focused === "password"
                    ? "1px solid rgba(167,139,250,0.5)" : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "10px", color: "#f1f5f9",
                  fontSize: "13px", outline: "none",
                  boxSizing: "border-box", transition: "all 0.2s",
                  fontFamily: "inherit",
                  boxShadow: focused === "password"
                    ? "0 0 0 3px rgba(124,58,237,0.08)" : "none",
                }}
              />
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    padding: "10px 14px",
                    background: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    borderRadius: "8px", color: "#f87171",
                    fontSize: "12px", marginBottom: "14px",
                  }}
                >⚠ {error}</motion.div>
              )}
            </AnimatePresence>

            {/* Button */}
            <motion.button
              whileHover={{ scale: 1.01, boxShadow: "0 0 40px rgba(124,58,237,0.35)" }}
              whileTap={{ scale: 0.99 }}
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: "100%", padding: "12px",
                background: loading
                  ? "rgba(124,58,237,0.25)"
                  : "linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #4f46e5 100%)",
                border: "1px solid rgba(167,139,250,0.2)",
                borderRadius: "10px", color: "#fff",
                fontSize: "13px", fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.2px", transition: "all 0.2s",
                fontFamily: "inherit",
                boxShadow: "0 0 24px rgba(124,58,237,0.2)",
              }}
            >
              {loading ? "Authenticating..." : "Get started →"}
            </motion.button>

            {/* Security */}
            <div style={{
              display: "flex", justifyContent: "center",
              gap: "20px", marginTop: "20px", paddingTop: "20px",
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}>
              {["JWT Secured", "Bcrypt", "Role-based"].map((t, i) => (
                <span key={i} style={{
                  fontSize: "10px", color: "#1e293b",
                  letterSpacing: "0.3px",
                  display: "flex", alignItems: "center", gap: "4px",
                }}>
                  <span style={{ color: "#4ade80" }}>✓</span> {t}
                </span>
              ))}
            </div>

            {/* Register link */}
            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <span style={{ fontSize: "12px", color: "#334155" }}>
                Don't have an account?{" "}
              </span>
              <span
                onClick={() => navigate("/register")}
                style={{
                  fontSize: "12px", color: "#a78bfa",
                  cursor: "pointer", fontWeight: "500",
                }}
              >Create one →</span>
            </div>

          </motion.div>
        </div>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
};

export default Login;