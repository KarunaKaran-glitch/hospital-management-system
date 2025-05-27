import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SERVER_URL from "../lib/constants.js";

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.role || !formData.loginId || !formData.password) {
      setError("All fields are required");
      return;
    }

    let response;

    if (formData.role === "patient") {
      try {
        response = await fetch(`${SERVER_URL}/login/${formData.role}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientId: formData.loginId,
            patientDateOfBirth: new Date(formData.password).toLocaleDateString(
              "en-IN"
            ),
          }),
        });

        const data = await response.json();
        if (!data.success) {
          setError(data.message);
          return;
        }

        // Store patient data in localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            role: "patient",
            patientId: formData.loginId,
            patientName: data.data?.patientName || "Patient",
            isLoggedIn: true,
          })
        );

        navigate("/patient/dashboard");
      } catch (error) {
        console.error("Login error:", error);
        setError("An error occurred during login. Please try again.");
      }
    } else if (formData.role === "doctor") {
      try {
        response = await fetch(`${SERVER_URL}/login/${formData.role}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            doctorId: formData.loginId,
            doctorDateOfBirth: new Date(formData.password).toLocaleDateString(
              "en-IN"
            ),
          }),
        });

        const data = await response.json();
        if (!data.success) {
          setError(data.message);
          return;
        }

        // Store doctor data in localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            role: "doctor",
            doctorId: formData.loginId,
            doctorName: data.data?.doctorName || "Doctor",
            specialization: data.data?.doctorSpecialist,
            isLoggedIn: true,
          })
        );

        navigate("/doctor/dashboard");
      } catch (error) {
        console.error("Login error:", error);
        setError("An error occurred during login. Please try again.");
      }
    } else if (
      formData.role === "admin" &&
      formData.loginId === "admin" &&
      formData.password === "admin"
    ) {
      // Store admin data in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          role: "admin",
          adminId: "admin",
          adminName: "Administrator",
          isLoggedIn: true,
        })
      );

      navigate("/admin/dashboard");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Hospital Management System</h1>
        <h2 className="login-subtitle">Login</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
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
              {formData.role === "patient" || formData.role === "doctor"
                ? "Date of Birth (YYYY-MM-DD)"
                : "Password"}
            </label>
            <input
              type={
                formData.role === "patient" || formData.role === "doctor"
                  ? "date"
                  : "password"
              }
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={
                formData.role === "patient" || formData.role === "doctor"
                  ? "DD-MM-YYYY"
                  : "••••••••"
              }
              className="form-control"
            />
          </div>

          <button className="login-button" type="submit">
            Login
          </button>
        </form>

        {(formData.role === "patient" || formData.role === "doctor") && (
          <div className="help-text">
            <p>{`${
              formData.role.charAt(0).toUpperCase() + formData.role.slice(1)
            }: Use your ${formData.role} ID and Date of Birth to login`}</p>
          </div>
        )}
      </div>
    </div>
  );
}
