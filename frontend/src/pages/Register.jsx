import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "developer"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password) {
      setError("Please fill in all fields"); return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match!"); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters"); return;
    }
    setLoading(true); setError("");
    try {
      await axios.post("http://localhost:8000/api/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed!");
    }
    setLoading(false);
  };

  const fields = [
    { key: "username", label: "USERNAME", type: "text", placeholder: "yourname" },
    { key: "email", label: "EMAIL ADDRESS", type: "email", placeholder: "name@company.com" },
    { key: "password", label: "PASSWORD", type: "password", placeholder: "••••••••••••" },
    { key: "confirmPassword", label: "CONFIRM PASSWORD", type: "password", placeholder: "••••••••••••" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#030308",
      display: "flex",
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* Background glows */}
      <div style={{
        position: "fixed",
        top: "-30%", left: "-20%",
        width: "80vw", height: "80vh",
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, rgba(99,102,241,0.08) 40%, transparent 70%)",
        pointerEvents: "none",
        filter: "blur(40px)", zIndex: 0,
      }} />
      <div style={{
        position: "fixed",
        bottom: "-20%", right: "-10%",
        width: "70vw", height: "70vh",
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(6,182,212,0.12) 0%, rgba(59,130,246,0.06) 40%, transparent 70%)",
        pointerEvents: "none",
        filter: "blur(50px)", zIndex: 0,
      }} />

      {/* Grid */}
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
        `,
        backgroundSize: "72px 72px",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Floating orbs */}
      {[
        { top: "15%", left: "20%", size: 4, color: "rgba(139,92,246,0.5)", dur: 7 },
        { top: "70%", left: "10%", size: 3, color: "rgba(6,182,212,0.4)", dur: 9 },
        { top: "80%", left: "60%", size: 3, color: "rgba(99,102,241,0.5)", dur: 8 },
        { top: "20%", left: "70%", size: 2, color: "rgba(6,182,212,0.3)", dur: 11 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          style={{
            position: "fixed",
            top: orb.top, left: orb.left,
            width: `${orb.size}px`, height: `${orb.size}px`,
            borderRadius: "50%",
            background: orb.color,
            boxShadow: `0 0 ${orb.size * 4}px ${orb.color}`,
            pointerEvents: "none", zIndex: 0,
          }}
          animate={{ y: [0, -20, 0], opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
        />
      ))}

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
          padding: "44px 64px",
          position: "relative",
          zIndex: 1,
          borderRight: "1px solid rgba(255,255,255,0.03)",
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
          onClick={() => navigate("/login")}
        >
          <div style={{
            width: "32px", height: "32px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #7c3aed, #6366f1)",
            boxShadow: "0 0 24px rgba(124,58,237,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: "13px", height: "13px",
              borderRadius: "3px",
              border: "2px solid rgba(255,255,255,0.85)",
            }} />
          </div>
          <span style={{
            fontSize: "15px", fontWeight: "600",
            color: "#f8fafc", letterSpacing: "-0.4px",
          }}>SysWatch AI</span>
        </motion.div>

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.65 }}
            style={{
              display: "inline-flex",
              alignItems: "center", gap: "8px",
              padding: "6px 16px", borderRadius: "100px",
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.2)",
              marginBottom: "32px",
            }}
          >
            <div style={{
              width: "6px", height: "6px",
              borderRadius: "50%",
              background: "#a78bfa",
              boxShadow: "0 0 8px #a78bfa",
            }} />
            <span style={{
              fontSize: "11px", color: "#a78bfa",
              letterSpacing: "1px", fontWeight: "500",
            }}>CREATE YOUR ACCOUNT</span>
          </motion.div>

          <h1 style={{
            fontSize: "clamp(28px, 3.5vw, 56px)",
            fontWeight: "800",
            fontFamily: "'Syne', sans-serif",
            lineHeight: "1.04", letterSpacing: "-3px",
            margin: "0 0 24px", maxWidth: "520px",
          }}>
            <span style={{ color: "#f8fafc" }}>Join the </span>
            <br />
            <span style={{
              background: "linear-gradient(90deg, #a78bfa 0%, #818cf8 35%, #38bdf8 70%, #34d399 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>next generation</span>
            <br />
            <span style={{ color: "#f8fafc" }}>of monitoring.</span>
          </h1>

          <p style={{
            fontSize: "15px", color: "#334155",
            lineHeight: "1.8", margin: "0 0 52px",
            maxWidth: "380px",
          }}>
            Get full access to real-time dashboards,
            AI anomaly detection, and self-healing
            suggestions for your infrastructure.
          </p>

          {/* Features list */}
          {[
            { icon: "◎", text: "Real-time service monitoring" },
            { icon: "⊗", text: "AI-powered anomaly detection" },
            { icon: "◈", text: "Self-healing fix suggestions" },
            { icon: "◇", text: "Live charts and analytics" },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              style={{
                display: "flex", alignItems: "center",
                gap: "12px", marginBottom: "14px",
              }}
            >
              <div style={{
                width: "28px", height: "28px",
                borderRadius: "7px",
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.15)",
                display: "flex", alignItems: "center",
                justifyContent: "center",
                fontSize: "13px", color: "#a78bfa",
              }}>{f.icon}</div>
              <span style={{
                fontSize: "13px", color: "#475569",
              }}>{f.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom */}
        <div style={{ fontSize: "11px", color: "#1e293b" }}>
          © 2026 SysWatch AI
        </div>
      </motion.div>

      {/* ── RIGHT PANEL ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          width: "500px",
          display: "flex", alignItems: "center",
          justifyContent: "center", padding: "44px",
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
              position: "absolute", top: 0,
              left: "15%", right: "15%", height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.6), rgba(56,189,248,0.4), transparent)",
            }} />

            <div style={{ marginBottom: "24px" }}>
              <h2 style={{
                fontSize: "22px", fontWeight: "700",
                color: "#f8fafc", letterSpacing: "-0.6px",
                margin: "0 0 6px",
              }}>Create account</h2>
              <p style={{ fontSize: "13px", color: "#334155", margin: 0 }}>
                Fill in your details to get started
              </p>
            </div>

            {/* Fields */}
            {fields.map((field, i) => (
              <motion.div
                key={field.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                style={{ marginBottom: "12px" }}
              >
                <label style={{
                  fontSize: "10px", fontWeight: "600",
                  color: focused === field.key ? "#a78bfa" : "#334155",
                  display: "block", marginBottom: "7px",
                  letterSpacing: "1px", transition: "color 0.2s",
                }}>{field.label}</label>
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={e => handleChange(field.key, e.target.value)}
                  onFocus={() => setFocused(field.key)}
                  onBlur={() => setFocused("")}
                  onKeyDown={e => e.key === "Enter" && handleRegister()}
                  placeholder={field.placeholder}
                  style={{
                    width: "100%", padding: "11px 14px",
                    background: focused === field.key
                      ? "rgba(124,58,237,0.06)"
                      : "rgba(255,255,255,0.025)",
                    border: focused === field.key
                      ? "1px solid rgba(167,139,250,0.5)"
                      : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "10px", color: "#f1f5f9",
                    fontSize: "13px", outline: "none",
                    boxSizing: "border-box", transition: "all 0.2s",
                    fontFamily: "inherit",
                    boxShadow: focused === field.key
                      ? "0 0 0 3px rgba(124,58,237,0.08)"
                      : "none",
                  }}
                />
              </motion.div>
            ))}

            {/* Role selector */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62 }}
              style={{ marginBottom: "20px" }}
            >
              <label style={{
                fontSize: "10px", fontWeight: "600",
                color: "#334155", display: "block",
                marginBottom: "7px", letterSpacing: "1px",
              }}>ROLE</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {["developer", "admin"].map(role => (
                  <button
                    key={role}
                    onClick={() => handleChange("role", role)}
                    style={{
                      flex: 1, padding: "10px",
                      background: form.role === role
                        ? "rgba(124,58,237,0.1)"
                        : "rgba(255,255,255,0.02)",
                      border: form.role === role
                        ? "1px solid rgba(124,58,237,0.4)"
                        : "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "8px",
                      color: form.role === role ? "#a78bfa" : "#334155",
                      fontSize: "12px", fontWeight: "500",
                      cursor: "pointer", fontFamily: "inherit",
                      transition: "all 0.2s",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </motion.div>

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
              onClick={handleRegister}
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
              {loading ? "Creating account..." : "Create account →"}
            </motion.button>

            {/* Login link */}
            <div style={{
              textAlign: "center", marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(255,255,255,0.04)",
            }}>
              <span style={{ fontSize: "12px", color: "#334155" }}>
                Already have an account?{" "}
              </span>
              <span
                onClick={() => navigate("/login")}
                style={{
                  fontSize: "12px", color: "#a78bfa",
                  cursor: "pointer", fontWeight: "500",
                }}
              >Sign in →</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        input::placeholder { color: #1e293b !important; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
};

export default Register;