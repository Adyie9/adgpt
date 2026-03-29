import { useState } from "react";
import api from "../services/api";
import GoogleLogin from "./GoogleLogin";

export default function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= EMAIL LOGIN =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await api.post(
        "/auth/login",
        { email, password },
        { withCredentials: true } // ⭐ IMPORTANT FOR JWT COOKIE
      );

      setMessage("✅ Login successful!");
      onLogin();
    } catch (err) {
      setError(err.response?.data?.message || "❌ Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="auth-container">
      <h2>AdGpt Login</h2>
      <h3>Login</h3>

      <form onSubmit={handleSubmit}>
        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* ---------- Divider ---------- */}
      <div
        style={{
          margin: "20px 0",
          textAlign: "center",
          fontWeight: "bold",
          color: "#777",
        }}
      >
        OR
      </div>

      {/* ================= GOOGLE LOGIN ================= */}
      <GoogleLogin onSuccess={onLogin} />

      {/* ---------- Messages ---------- */}
      {error && <p className="auth-error">{error}</p>}
      {message && <p className="auth-success">{message}</p>}

      {/* ---------- Switch ---------- */}
      <p style={{ marginTop: "1rem" }}>
        Don’t have an account?{" "}
        <button
          type="button"
          style={{
            color: "#4f46e5",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          onClick={onSwitchToRegister}
        >
          Register
        </button>
      </p>
    </div>
  );
}