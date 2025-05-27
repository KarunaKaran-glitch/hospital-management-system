import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState("todayAppointments");
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportForm, setReportForm] = useState({
    visitId: "",
    patientId: "",
    remarks: "",
    prescription: "",
    followUpDate: "",
  });
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  const navigate = useNavigate();
  const SERVER_URL = "http://localhost:5001";

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    // Check if user is logged in as doctor
    if (!userData.doctorId) {
      navigate("/");
      return;
    }

    fetchAppointments();
  }, []); // Added navigate to dependency array

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      // Get today's date in ISO format (YYYY-MM-DD)
      // const today = new Date().toISOString().split("T")[0];

      // Fetch today's appointments
      const todayResponse = await fetch(
        
        `${SERVER_URL}/visits/doctor/${userData.doctorId}/today`
      );

      // Fetch upcoming appointments
      const upcomingResponse = await fetch(
        `${SERVER_URL}/visits/doctor/${userData.doctorId}/upcoming`
      );

      if (!todayResponse.ok) {
        throw new Error(`HTTP error! Status: ${todayResponse.status}`);
      }

      if (!upcomingResponse.ok) {
        throw new Error(`HTTP error! Status: ${upcomingResponse.status}`);
      }

      const todayData = await todayResponse.json();
      const upcomingData = await upcomingResponse.json();

      if (todayData.success) {
        setTodayAppointments(todayData.data || []);
      } else {
        console.error(
          "Failed to fetch today's appointments:",
          todayData.message
        );
        setError("Failed to load today's appointments: " + todayData.message);
      }

      if (upcomingData.success) {
        setUpcomingAppointments(upcomingData.data || []);
      } else {
        console.error(
          "Failed to fetch upcoming appointments:",
          upcomingData.message
        );
        setError(
          "Failed to load upcoming appointments: " + upcomingData.message
        );
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to load appointments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = (visit) => {
    setSelectedVisit(visit);
    setReportForm({
      visitId: visit.visit_id || "",
      patientId: visit.patient_id || "",
      remarks: "",
      prescription: "",
      followUpDate: "",
    });
    setShowReportForm(true);
  };

  const handleReportFormChange = (e) => {
    const { name, value } = e.target;
    setReportForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!reportForm.remarks) {
      setError("Doctor's remarks are required");
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitId: reportForm.visitId,
          doctorId: userData.doctorId,
          patientId: reportForm.patientId,
          doctorRemarks: reportForm.remarks,
          prescription: reportForm.prescription,
          followUpDate: reportForm.followUpDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Update visit status to completed
        await updateVisitStatus(reportForm.visitId, "visited");

        // Close form and refresh appointments
        setShowReportForm(false);
        fetchAppointments();
      } else {
        setError(data.message || "Failed to create report");
      }
    } catch (error) {
      console.error("Error creating report:", error);
      setError("An error occurred. Please try again.");
    }
  };

  const updateVisitStatus = async (visitId, status) => {
    try {
      const response = await fetch(`${SERVER_URL}/visits/${visitId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating visit status:", error);
      return { success: false, message: error.message };
    }
  };

  const markVisitAs = async (visitId, status) => {
    try {
      setError("");
      const result = await updateVisitStatus(visitId, status);

      if (result.success) {
        fetchAppointments();
      } else {
        setError(`Failed to mark visit as ${status}: ${result.message || ""}`);
      }
    } catch (error) {
      console.error(`Error marking visit as ${status}:`, error);
      setError("An error occurred. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateString || "N/A";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = { hour: "2-digit", minute: "2-digit" };
      return new Date(dateString).toLocaleTimeString(undefined, options);
    } catch (e) {
      console.error("Time formatting error:", e);
      return "N/A";
    }
  };

  const getStatusClass = (status) => {
    if (!status) return "";

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

  const clearError = () => {
    setError("");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Doctor Dashboard</h1>
        <p>Welcome, Dr. {userData.doctorName || "Doctor"}</p>
      </div>

      {error && (
        <div className="error-message dashboard-alert">
          {error}
          <button className="close-error" onClick={clearError}>
            ×
          </button>
        </div>
      )}

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${
            activeTab === "todayAppointments" ? "active" : ""
          }`}
          onClick={() => setActiveTab("todayAppointments")}
        >
          Today's Appointments
        </button>
        <button
          className={`tab-button ${
            activeTab === "upcomingAppointments" ? "active" : ""
          }`}
          onClick={() => setActiveTab("upcomingAppointments")}
        >
          Upcoming Appointments
        </button>
      </div>

      <div className="dashboard-content">
        {showReportForm && (
          <div className="report-form-overlay">
            <div className="report-form-container">
              <div className="report-form-header">
                <h3>Create Medical Report</h3>
                <button
                  className="close-button"
                  onClick={() => setShowReportForm(false)}
                >
                  &times;
                </button>
              </div>

              <div className="patient-info">
                <p>
                  <strong>Patient:</strong>{" "}
                  {selectedVisit?.patient_name || "N/A"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {formatDate(selectedVisit?.date_of_visit)}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {formatTime(selectedVisit?.date_of_visit)}
                </p>
                <p>
                  <strong>Reason:</strong>{" "}
                  {selectedVisit?.visit_reason || "N/A"}
                </p>
              </div>

              <form onSubmit={handleReportSubmit}>
                <div className="form-group">
                  <label htmlFor="remarks">Doctor's Remarks*</label>
                  <textarea
                    id="remarks"
                    name="remarks"
                    rows="4"
                    value={reportForm.remarks}
                    onChange={handleReportFormChange}
                    placeholder="Enter your diagnosis and observations"
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="prescription">Prescription</label>
                  <textarea
                    id="prescription"
                    name="prescription"
                    rows="3"
                    value={reportForm.prescription}
                    onChange={handleReportFormChange}
                    placeholder="Enter medications and dosage instructions"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="followUpDate">
                    Follow-up Date (if needed)
                  </label>
                  <input
                    type="date"
                    id="followUpDate"
                    name="followUpDate"
                    value={reportForm.followUpDate}
                    onChange={handleReportFormChange}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowReportForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-button">
                    Submit Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "todayAppointments" && (
          <div className="appointments-section">
            <h2>Today's Appointments</h2>

            {loading ? (
              <div className="loading">Loading appointments...</div>
            ) : todayAppointments.length === 0 ? (
              <div className="no-data">
                No appointments scheduled for today.
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Patient ID</th>
                      <th>Patient Name</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayAppointments.map((visit) => (
                      <tr
                        key={
                          visit.visit_id ||
                          `${visit.patient_id}-${visit.date_of_visit}`
                        }
                      >
                        <td>{formatTime(visit.date_of_visit)}</td>
                        <td>{visit.patient_id}</td>
                        <td>{visit.patient_name || "Unknown"}</td>
                        <td>{visit.visit_reason || "N/A"}</td>
                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              visit.visit_status
                            )}`}
                          >
                            {visit.visit_status || "Unknown"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {visit.visit_status === "pending" && (
                              <>
                                <button
                                  className="action-button create-report-button"
                                  onClick={() => handleCreateReport(visit)}
                                >
                                  Create Report
                                </button>
                                <button
                                  className="action-button mark-missed-button"
                                  onClick={() =>
                                    markVisitAs(visit.visit_id, "missed")
                                  }
                                >
                                  Mark Missed
                                </button>
                              </>
                            )}
                            {visit.visit_status === "visited" && (
                              <button
                                className="action-button view-report-button"
                                onClick={() =>
                                  alert(
                                    "View report functionality to be implemented"
                                  )
                                }
                              >
                                View Report
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "upcomingAppointments" && (
          <div className="appointments-section">
            <h2>Upcoming Appointments</h2>

            {loading ? (
              <div className="loading">Loading appointments...</div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="no-data">No upcoming appointments scheduled.</div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Patient ID</th>
                      <th>Patient Name</th>
                      <th>Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingAppointments.map((visit) => (
                      <tr
                        key={
                          visit.visit_id ||
                          `${visit.patient_id}-${visit.date_of_visit}`
                        }
                      >
                        <td>{formatDate(visit.date_of_visit)}</td>
                        <td>{formatTime(visit.date_of_visit)}</td>
                        <td>{visit.patient_id}</td>
                        <td>{visit.patient_name || "Unknown"}</td>
                        <td>{visit.visit_reason || "N/A"}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-button cancel-button"
                              onClick={() =>
                                markVisitAs(visit.visit_id, "cancelled")
                              }
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
