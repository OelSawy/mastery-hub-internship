import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/user/login", { email, password, "type": "user" });
      navigate("/products");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome Back</h1>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <div
          type="button"
          className="signup-button"
          onClick={() => navigate("/register")}
        >
          Don't have an account? Sign up
        </div>
        <div
          type="button"
          className="signup-button"
          onClick={() => navigate("/admin-login")}
        >
          Admin ? Login to your dashboard here
        </div>
      </div>
    </div>
  );
}
