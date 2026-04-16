import React, { useState } from "react";
import { useIonRouter } from "@ionic/react";
import "../Login/Login.css"; // reuse same styling
import API from "../../services/api";

interface ForgotPasswordResponse {
  message: string;
}

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  

  const router = useIonRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    try {
      const res = await API.post<ForgotPasswordResponse>(
        "/auth/forgot-password",
        { email }
        );

        setMessage(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const goToLogin = () => {
    router.push("/login", "back");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo */}
        <div className="logo-section">
          <div className="logo-circle">
            <span className="logo-icon">🌾</span>
          </div>
          <h1 className="app-title">FarmAssist</h1>
          <p className="app-subtitle">Reset Your Password</p>
        </div>

        <div className="welcome-section">
          <h2 className="welcome-title">Forgot Password?</h2>
          <p className="welcome-subtitle">
            Enter your email to receive reset link
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="login-btn">
            Send Reset Link
          </button>

          <div className="signup-section">
            <p className="signup-text">
              Remember your password?{" "}
              <button
                type="button"
                className="signup-link"
                onClick={goToLogin}
              >
                Login
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;