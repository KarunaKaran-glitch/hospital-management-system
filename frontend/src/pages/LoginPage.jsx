import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    role: "",
    loginId: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.role || !formData.loginId || !formData.password) {
      setError("All fields are required");
      return;
    }

    // Example login logic
    if (formData.role === "patient") {
      // For patients, check if password is a valid date
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(formData.password)) {
        setError(
          "Patient password should be in YYYY-MM-DD format (date of birth)"
        );
        return;
      }
    }

    // In a real app, you would make an API call to verify credentials
    console.log("Login attempt:", formData);

    // Redirect based on role
    switch (formData.role) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "doctor":
        navigate("/doctor/dashboard");
        break;
      case "patient":
        navigate("/patient/dashboard");
        break;
      default:
        setError("Invalid role selected");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Hospital Management System</h1>
        <h2 className="login-subtitle">Login</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="role">Select Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">-- Select Role --</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="loginId">Login ID</label>
            <input
              type="text"
              id="loginId"
              name="loginId"
              value={formData.loginId}
              onChange={handleChange}
              placeholder={
                formData.role === "patient"
                  ? "Patient ID (p00001)"
                  : formData.role === "doctor"
                  ? "Doctor ID (d001)"
                  : "Admin ID"
              }
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              {formData.role === "patient"
                ? "Date of Birth (YYYY-MM-DD)"
                : "Password"}
            </label>
            <input
              type={formData.role === "patient" ? "date" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={
                formData.role === "patient" ? "YYYY-MM-DD" : "••••••••"
              }
              className="form-control"
            />
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        {formData.role === "patient" && (
          <div className="help-text">
            <p>Patients: Use your Patient ID and Date of Birth to login</p>
          </div>
        )}
      </div>
    </div>
  );
}
