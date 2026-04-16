import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import './SignUp.css';
import API from "../../services/api";

interface LocationState {
  message?: string;
}

// Indian states list
const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

const SignUp: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});
  const [message, setMessage] = useState('');
  const history = useHistory();
  const location = useLocation<LocationState>();
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location]);

  const validateField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case 'fullName':
        if (!value.trim()) return 'Please fill out this field';
        if (value.trim().length < 3) return 'Name must be at least 3 characters';
        return '';
      
      case 'mobileNumber':
        if (!value) return 'Please fill out this field';
        if (!/^\d{10}$/.test(value)) return 'Please enter a valid 10-digit mobile number';
        return '';
      
      case 'state':
        if (!value) return 'Please fill out this field';
        return '';
      
      case 'district':
        if (!value.trim()) return 'Please fill out this field';
        return '';
      
      case 'password':
        if (!value) return 'Please fill out this field';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      
      case 'confirmPassword':
        if (!value) return 'Please fill out this field';
        if (value !== password) return 'Passwords do not match';
        return '';
      
      default:
        return '';
    }
  };

  const handleBlur = (fieldName: string, value: string) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleChange = (fieldName: string, value: string) => {
    // Clear error when user starts typing
    if (touchedFields[fieldName] && errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };


  interface SignupResponse {
  message: string;
  userId: string;
}

const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!isOtpVerified) {
    alert("Please verify OTP first");
    return;
  }

  try {
    const response = await API.post("/auth/signup", {
      name: fullName,
      phone: mobileNumber,
      email,
      state,
      district,
      password
    });

    alert("Account created successfully!");
    history.push("/login");

  } catch (error: any) {
    alert(error.response?.data?.message || "Signup failed");
  }
};


interface SendOtpResponse {
  message: string;
  userId: string;
}

const handleSendOtp = async () => {
  if (!/^\d{10}$/.test(mobileNumber)) {
    alert("Enter valid 10 digit mobile number first");
    return;
  }

  try {
    setIsSendingOtp(true);

    const response = await API.post<SendOtpResponse>(
      "/auth/send-otp",
      {
        phone: mobileNumber
      }
    );

    setUserId(response.data.userId);
    setIsOtpSent(true);

    alert("OTP sent successfully!");

  } catch (error: any) {
    alert(error.response?.data?.message || "Failed to send OTP");
  } finally {
    setIsSendingOtp(false);
  }
};

const handleVerifyOtp = async () => {
  if (!otp) {
    alert("Enter OTP");
    return;
  }

  interface VerifyOtpResponse {
  token: string;
}

  try {
    const response = await API.post<VerifyOtpResponse>(
  "/auth/verify-otp",
  {
    userId,
    otp
  }
);

localStorage.setItem("token", response.data.token);

    setIsOtpVerified(true);
    alert("OTP Verified Successfully!");

  } catch (error: any) {
    alert(error.response?.data?.message || "Invalid OTP");
  }
};

  const handleLoginClick = () => {
    history.push('/login');
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <div className="logo-wrapper">
            <div className="logo-circle">
              <span className="logo-icon">🌾</span>
            </div>
          </div>
          <h1 className="page-title">Create Account</h1>
          <p className="page-subtitle">Join FarmAssist Today</p>
        </div>

        <div className="signup-content">
          {message && <div className="info-banner">{message}</div>}

          <form className="signup-form" onSubmit={handleSignUp}>
            {/* Full Name */}
            <div className="form-field">
              <label className="field-label">
                Full Name <span className="asterisk">*</span>
              </label>
              <div className="input-container">
                <span className="field-icon">👤</span>
                <input
                  type="text"
                  className={`field-input ${touchedFields.fullName && errors.fullName ? 'has-error' : ''}`}
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    handleChange('fullName', e.target.value);
                  }}
                  onBlur={() => handleBlur('fullName', fullName)}
                />
              </div>
              {touchedFields.fullName && errors.fullName && (
                <div className="error-bubble">{errors.fullName}</div>
              )}
            </div>

            {/* Email */}
            <div className="form-field">
              <label className="field-label">
                Email <span className="asterisk">*</span>
              </label>
              <div className="input-container">
                <span className="field-icon">📧</span>
                <input
                  type="email"
                  className="field-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="form-field">
              <label className="field-label">
                Mobile Number <span className="asterisk">*</span>
              </label>
              <div className="input-container">
                <span className="field-icon">📱</span>
                <input
                  type="tel"
                  className={`field-input ${touchedFields.mobileNumber && errors.mobileNumber ? 'has-error' : ''}`}
                  placeholder="10 digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setMobileNumber(value);
                      handleChange('mobileNumber', value);
                    }
                  }}
                  onBlur={() => handleBlur('mobileNumber', mobileNumber)}
                  maxLength={10}
                />
              </div>
              {touchedFields.mobileNumber && errors.mobileNumber && (
                <div className="error-bubble">{errors.mobileNumber}</div>
              )}
            </div>

            {/* OTP Section */}
{!isOtpSent && (
  <button
    type="button"
    className="otp-button"
    onClick={handleSendOtp}
    disabled={isSendingOtp}
  >
    {isSendingOtp ? "Sending..." : "Send OTP"}
  </button>
)}

{isOtpSent && !isOtpVerified && (
  <div className="form-field">
    <label className="field-label">
      Enter OTP <span className="asterisk">*</span>
    </label>

    <div className="input-container">
      <span className="field-icon">🔢</span>
      <input
        type="text"
        className="field-input"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        maxLength={6}
      />
    </div>

    <button
      type="button"
      className="verify-otp-button"
      onClick={handleVerifyOtp}
    >
      Verify OTP
    </button>
  </div>
)}

{isOtpVerified && (
  <div className="otp-success">
    ✅ Mobile number verified
  </div>
)}

            {/* State */}
            <div className="form-field">
              <label className="field-label">
                State <span className="asterisk">*</span>
              </label>
              <div className="input-container">
                <span className="field-icon">📍</span>
                <select
                  className={`field-select ${touchedFields.state && errors.state ? 'has-error' : ''}`}
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    handleChange('state', e.target.value);
                  }}
                  onBlur={() => handleBlur('state', state)}
                >
                  <option value="">Select your state</option>
                  {indianStates.map((stateName) => (
                    <option key={stateName} value={stateName}>
                      {stateName}
                    </option>
                  ))}
                </select>
                <span className="dropdown-arrow">▼</span>
              </div>
              {touchedFields.state && errors.state && (
                <div className="error-bubble">{errors.state}</div>
              )}
            </div>

            {/* District */}
            <div className="form-field">
              <label className="field-label">
                District <span className="asterisk">*</span>
              </label>
              <div className="input-container">
                <span className="field-icon">📍</span>
                <input
                  type="text"
                  className={`field-input ${touchedFields.district && errors.district ? 'has-error' : ''}`}
                  placeholder="Enter your district"
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    handleChange('district', e.target.value);
                  }}
                  onBlur={() => handleBlur('district', district)}
                />
              </div>
              {touchedFields.district && errors.district && (
                <div className="error-bubble">{errors.district}</div>
              )}
            </div>

            {/* Password */}
            <div className="form-field">
              <label className="field-label">
                Password <span className="asterisk">*</span>
              </label>
              <div className="input-container">
                <span className="field-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`field-input ${touchedFields.password && errors.password ? 'has-error' : ''}`}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    handleChange('password', e.target.value);
                  }}
                  onBlur={() => handleBlur('password', password)}
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {touchedFields.password && errors.password && (
                <div className="error-bubble">{errors.password}</div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-field">
              <label className="field-label">
                Confirm Password <span className="asterisk">*</span>
              </label>
              <div className="input-container">
                <span className="field-icon">🔒</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`field-input ${touchedFields.confirmPassword && errors.confirmPassword ? 'has-error' : ''}`}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    handleChange('confirmPassword', e.target.value);
                  }}
                  onBlur={() => handleBlur('confirmPassword', confirmPassword)}
                />
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {touchedFields.confirmPassword && errors.confirmPassword && (
                <div className="error-bubble">{errors.confirmPassword}</div>
              )}
            </div>

            {/* Terms */}
            <div className="terms-wrapper">
              <p className="terms-text">
                By signing up, you agree to our{' '}
                <span className="terms-link">Terms & Conditions</span> and{' '}
                <span className="terms-link">Privacy Policy</span>
              </p>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              className="submit-button"
              disabled={!isOtpVerified}
            >
              Sign Up
            </button>

            {/* Login Link */}
            <div className="bottom-link">
              <p className="link-text">
                Already have an account?{' '}
                <button
                  type="button"
                  className="switch-link"
                  onClick={handleLoginClick}
                >
                  Login
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;