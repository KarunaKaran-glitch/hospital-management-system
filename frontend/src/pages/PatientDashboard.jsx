import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SERVER_URL from "../lib/constants";
import "../styles/Dashboard.css";

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("appointments");
  const [visits, setVisits] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentForm, setAppointmentForm] = useState({
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    // Check if user is logged in
    if (!userData.patientId) {
      navigate("/");
      return;
    }
  }, [navigate, userData.patientId]);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${SERVER_URL}/visits/patient/pending?patientId=${userData.patientId}`
      );
      const data = await response.json();

      if (data.success) {
        setVisits(data.data || []);
      } else {
        console.error("Failed to fetch visits:", data.message);
      }
    } catch (error) {
      console.error("Error fetching visits:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDoctors = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/doctors/available`);
      const data = await response.json();

      if (data.success) {
        setDoctors(data.data || []);
      } else {
        console.error("Failed to fetch doctors:", data.message);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${SERVER_URL}/reports?patientId=${userData.patientId}`
      );
      const data = await response.json();

      if (data.success) {
        setReports(data.data || []);
      } else {
        console.error("Failed to fetch reports:", data.message);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setAppointmentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const dateTime = new Date(
        `${appointmentForm.appointmentDate}T${appointmentForm.appointmentTime}`
      ).toISOString();

      const response = await fetch(`${SERVER_URL}/visits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: userData.patientId,
          doctorId: appointmentForm.doctorId,
          dateOfVisit: dateTime,
          visitReason: appointmentForm.reason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Appointment scheduled successfully!");
        setAppointmentForm({
          doctorId: "",
          appointmentDate: "",
          appointmentTime: "",
          reason: "",
        });
        fetchVisits();
      } else {
        setError(data.message || "Failed to schedule appointment");
      }
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      setError("An error occurred. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateTimeString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateTimeString).toLocaleTimeString(undefined, options);
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "status-pending";
      case "visited":
        return "status-visited";
      case "missed":
        return "status-missed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Patient Dashboard</h1>
          <p>Welcome, {userData.patientName || "Patient"}</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${
            activeTab === "appointments" ? "active" : ""
          }`}
          onClick={() => {
            setActiveTab("appointments");
            fetchVisits();
          }}
        >
          My Appointments
        </button>
        <button
          className={`tab-button ${activeTab === "schedule" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("schedule");
            fetchAvailableDoctors();
          }}
        >
          Schedule Appointment
        </button>
        <button
          className={`tab-button ${activeTab === "records" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("records");
            fetchReports();
          }}
        >
          Medical Records
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "appointments" && (
          <div className="appointments-section">
            <h2>My Appointments</h2>
            {loading ? (
              <div className="loading">Loading appointments...</div>
            ) : visits.length === 0 ? (
              <div className="no-data">
                No appointments found. Schedule your first appointment.
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Doctor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.map((visit) => (
                      <tr
                        key={`${visit.patient_id}-${visit.doctor_id}-${visit.date_of_visit}`}
                      >
                        <td>{formatDate(visit.date_of_visit)}</td>
                        <td>{formatTime(visit.date_of_visit)}</td>
                        <td>{visit.doctor_name}</td>
                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              visit.visit_status
                            )}`}
                          >
                            {getStatusLabel(visit.visit_status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="schedule-section">
            <h2>Schedule New Appointment</h2>
            <div className="form-container">
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <form onSubmit={handleAppointmentSubmit}>
                <div className="form-group">
                  <label htmlFor="doctorId">Select Available Doctor</label>
                  <select
                    id="doctorId"
                    name="doctorId"
                    value={appointmentForm.doctorId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">-- Select a doctor --</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.doctor_id} value={doctor.doctor_id}>
                        {doctor.doctor_name} - {doctor.doctor_specalist}
                      </option>
                    ))}
                  </select>
                  {doctors.length === 0 && (
                    <p className="note">No doctors are currently available.</p>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="appointmentDate">Date</label>
                    <input
                      type="date"
                      id="appointmentDate"
                      name="appointmentDate"
                      value={appointmentForm.appointmentDate}
                      onChange={handleFormChange}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="appointmentTime">Time</label>
                    <input
                      type="time"
                      id="appointmentTime"
                      name="appointmentTime"
                      value={appointmentForm.appointmentTime}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reason">Reason for Visit</label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={appointmentForm.reason}
                    onChange={handleFormChange}
                    rows="4"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={doctors.length === 0}
                >
                  Schedule Appointment
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "records" && (
          <div className="records-section">
            <h2>My Medical Records</h2>

            {loading ? (
              <div className="loading">Loading medical records...</div>
            ) : reports.length === 0 ? (
              <div className="no-data">No medical records found.</div>
            ) : (
              <div className="medical-records">
                {reports.map((report) => (
                  <div className="record-card" key={report.report_id}>
                    <div className="record-header">
                      <h3>Report: {report.report_id}</h3>
                      <span className="record-date">
                        {formatDate(report.date_of_visit)}
                      </span>
                    </div>
                    <div className="record-details">
                      <p>
                        <strong>Doctor:</strong> {report.doctor_name}
                      </p>
                      <p>
                        <strong>Visit Date:</strong>{" "}
                        {formatDate(report.date_of_visit)} at{" "}
                        {formatTime(report.date_of_visit)}
                      </p>
                      <p>
                        <strong>Doctor's Remarks:</strong>{" "}
                        {report.doctor_remarks}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
