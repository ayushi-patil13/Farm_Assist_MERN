import React, { useState } from 'react';
import { useIonRouter } from '@ionic/react';
import './Login.css';
import API from "../../services/api";
import { IonPage, IonContent } from '@ionic/react';

const Login: React.FC = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const router = useIonRouter();

  interface LoginResponse {
    token: string;
    user: {
      _id: string;
      name: string;
    };
    redirect?: "HOME" | "PROFILE" | "CHANGE_PASSWORD"; // ✅ ADD THIS
    message?: string;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!mobileNumber || !password) {
      setError('Please enter both mobile number and password');
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      const response = await API.post<LoginResponse>("/auth/login", {
        phone: mobileNumber,
        password
      });

      // Save token in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.user._id);
      localStorage.setItem("userName", response.data.user.name);

      // 🔥 ADD THIS
      console.log("Login Response:", response.data);
      console.log("Stored userId:", response.data.user._id);

      // ❌ REMOVE alert (can break flow)
      // alert(response.data.message);

      if (!response.data.user?._id) {
        console.log("❌ userId missing in response");
        return;
      }

      if (response.data.redirect === "CHANGE_PASSWORD") {
        router.push("/change-password", "forward", "replace");
      } else if (response.data.redirect === "PROFILE") {
        router.push("/profile", "forward", "replace");
      } else {
        router.push("/home", "forward", "replace");
      }

      console.log("Login Response:", response.data);
      console.log("Stored userId:", localStorage.getItem("userId"));

    } catch (error: any) {
      setError(error.response?.data?.message || "Login failed");
    }
  };

  const handleSignUpClick = () => {
    router.push('/signup', "forward");
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password', "forward");
  };

  return (
        <div className="login-container">
          <div className="login-card">
            <div className="logo-section">
              <div className="logo-circle">
                <span className="logo-icon">🌾</span>
              </div>
              <h1 className="app-title">FarmAssist</h1>
              <p className="app-subtitle">Your Smart Farming Partner</p>
            </div>

            <div className="welcome-section">
              <h2 className="welcome-title">Welcome Back!</h2>
              <p className="welcome-subtitle">Login to manage your farm</p>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Enter your mobile number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="forgot-password-section">
                <button
                  type="button"
                  className="forgot-password-btn"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="login-btn">
                Login
              </button>

              <div className="divider">
                <span>OR</span>
              </div>

              <div className="signup-section">
                <p className="signup-text">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="signup-link"
                    onClick={handleSignUpClick}
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
  );
};

export default Login;