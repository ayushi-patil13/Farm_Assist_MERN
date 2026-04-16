import React, { useState } from "react";
import { useIonRouter } from "@ionic/react";
import API from "../../services/api";
import "../Login/Login.css";

const ChangePassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const router = useIonRouter();

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await API.post(
        "/auth/change-password",
        {
          newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      alert("Password updated successfully");

      router.push("/home", "forward", "replace");

    } catch (err: any) {
      setError(err.response?.data?.message || "Error updating password");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <div className="logo-circle">
            <span className="logo-icon">🌾</span>
          </div>
          <h1 className="app-title">FarmAssist</h1>
          <p className="app-subtitle">Change Password</p>
        </div>

        <form className="login-form" onSubmit={handleChange}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-btn">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;