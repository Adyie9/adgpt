import { useState } from "react";
import api from "../services/api";

export default function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/auth/login", { email, password }); // 🚫 no role check
      setMessage("✅ Login successful!");
      onLogin();
    } catch (err) {
      setError(err.response?.data?.message || "❌ Login failed");
    }
  };

  return (
    <div className="auth-container">
      <h2>AdGpt Login</h2>
      <h3>Login</h3>
      <form onSubmit={handleSubmit}>
        <input className="auth-input" type="email" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="auth-input" type="password" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)} required />

        {/* 🚫 Removed role selection */}

        <button className="auth-button" type="submit">Login</button>
      </form>

      {error && <p className="auth-error">{error}</p>}
      {message && <p className="auth-success">{message}</p>}

      <p style={{ marginTop: "1rem" }}>
        Don’t have an account?{" "}
        <button type="button" style={{ color: "#4f46e5", background: "none", border: "none", cursor: "pointer" }}
          onClick={onSwitchToRegister}>
          Register
        </button>
      </p>
    </div>
  );
}
