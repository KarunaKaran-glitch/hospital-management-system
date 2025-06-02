import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SERVER_URL from "../lib/constants";
import "../styles/Dashboard.css";
import "../styles/AdminDashboard.css";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("patientServices");
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    patientStats: {
      totalPatients: 0,
      patientsByGender: {},
      patientsByBloodGroup: {},
      patientsByAgeGroup: {},
      recentlyAddedPatients: []
    },
    doctorStats: {
      totalDoctors: 0,
      availableDoctors: 0,
      doctorsBySpecialization: {},
      doctorsByGender: {}
    },
    visitStats: {
      totalVisits: 0,
      visitsByStatus: {},
      visitsByDoctor: {},
      visitsByDay: {},
      visitsByMonth: {},
      recentVisits: []
    }
  });

  const [patientForm, setPatientForm] = useState({
    patientName: "",
    dateOfBirth: "",
    gender: "",
    contactNumber: "",
    address: "",
    bloodGroup: "",
    height: "",
    weight: "",
  });

  const [doctorForm, setDoctorForm] = useState({
    doctorName: "",
    dateOfBirth: "",
    specialization: "",
    contactNumber: "",
    gender: "",
    address: "",
    isAvailable: true,
  });

  const [patientError, setPatientError] = useState("");
  const [patientSuccess, setPatientSuccess] = useState("");
  const [doctorError, setDoctorError] = useState("");
  const [doctorSuccess, setDoctorSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const userDetails = JSON.parse(localStorage.getItem("user"));
    if (!userDetails || userDetails.role !== "admin") {
      navigate("/");
      return;
    }

    if (activeTab === "patientServices") {
      fetchPatients();
    } else if (activeTab === "doctorServices") {
      fetchDoctors();
    } else if (activeTab === "statistics") {
      fetchStatistics();
    }
  }, [activeTab, navigate]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${SERVER_URL}/patients`);
      const data = await response.json();

      if (data.success) {
        setPatients(data.data || []);
      } else {
        console.error("Failed to fetch patients:", data.message);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${SERVER_URL}/doctors`);
      const data = await response.json();
      console.log(data);

      if (data.success) {
        setDoctors(data.data || []);
      } else {
        console.error("Failed to fetch doctors:", data.message);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // Fetch all statistics in parallel
      const [patientStatsResponse, doctorStatsResponse, visitStatsResponse] = await Promise.all([
        fetch(`${SERVER_URL}/admin/statistics/patients`),
        fetch(`${SERVER_URL}/admin/statistics/doctors`),
        fetch(`${SERVER_URL}/admin/statistics/visits`)
      ]);

      if (!patientStatsResponse.ok || !doctorStatsResponse.ok || !visitStatsResponse.ok) {
        throw new Error("Failed to fetch statistics data");
      }

      const patientStats = await patientStatsResponse.json();
      const doctorStats = await doctorStatsResponse.json();
      const visitStats = await visitStatsResponse.json();

      setStatistics({
        patientStats: patientStats.data,
        doctorStats: doctorStats.data,
        visitStats: visitStats.data
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPatientForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDoctorFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDoctorForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setPatientError("");
    setPatientSuccess("");

    if (!patientForm.patientName || !patientForm.dateOfBirth) {
      setPatientError("Patient Name and Date of Birth are required");
      return;
    }

    // Check if we're in edit mode
    const isEditing = Boolean(patientForm.patientId);
    const url = isEditing
      ? `${SERVER_URL}/patients/${patientForm.patientId}`
      : `${SERVER_URL}/patients`;

    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientName: patientForm.patientName,
          dateOfBirth: patientForm.dateOfBirth,
          gender: patientForm.gender,
          contactNumber: patientForm.contactNumber,
          address: patientForm.address,
          bloodGroup: patientForm.bloodGroup,
          height: patientForm.height ? parseFloat(patientForm.height) : null,
          weight: patientForm.weight ? parseFloat(patientForm.weight) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPatientSuccess(
          isEditing
            ? `Patient updated successfully`
            : `Patient created successfully with ID: ${data.data.patient_id}`
        );

        // Reset form
        setPatientForm({
          patientId: "",
          patientName: "",
          dateOfBirth: "",
          gender: "",
          contactNumber: "",
          address: "",
          bloodGroup: "",
          height: "",
          weight: "",
        });

        // Refresh the patient list
        fetchPatients();
      } else {
        setPatientError(
          data.message || `Failed to ${isEditing ? "update" : "create"} patient`
        );
      }
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} patient:`,
        error
      );
      setPatientError("An error occurred. Please try again.");
    }
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setDoctorError("");
    setDoctorSuccess("");

    if (!doctorForm.doctorName || !doctorForm.specialization) {
      setDoctorError("Doctor Name and Specialization are required");
      return;
    }

    // Check if we're updating an existing doctor
    const isEditing = Boolean(doctorForm.doctorId);
    const url = isEditing
      ? `${SERVER_URL}/doctors/${doctorForm.doctorId}`
      : `${SERVER_URL}/doctors`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorName: doctorForm.doctorName,
          doctorDateOfBirth: doctorForm.dateOfBirth,
          doctorSpecialization: doctorForm.specialization,
          contactNumber: doctorForm.contactNumber,
          doctorGender: doctorForm.gender,
          address: doctorForm.address,
          isAvailable: doctorForm.isAvailable,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDoctorSuccess(
          isEditing
            ? `Doctor updated successfully`
            : `Doctor created successfully with ID: ${data.data}!`
        );

        // Reset form
        setDoctorForm({
          doctorId: "",
          doctorName: "",
          dateOfBirth: "",
          specialization: "",
          contactNumber: "",
          gender: "",
          address: "",
          isAvailable: true,
        });

        // Refresh doctor list
        fetchDoctors();
      } else {
        setDoctorError(
          data.message || `Failed to ${isEditing ? "update" : "create"} doctor`
        );
      }
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} doctor:`,
        error
      );
      setDoctorError("An error occurred. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const togglePatientForm = () => {
    setShowPatientForm(!showPatientForm);
    if (!showPatientForm) {
      setPatientError("");
      setPatientSuccess("");
    }
  };

  const toggleDoctorForm = () => {
    setShowDoctorForm(!showDoctorForm);
    if (!showDoctorForm) {
      setDoctorError("");
      setDoctorSuccess("");
    }
  };

  const handleViewPatient = (patient) => {
    // For now, just show an alert with patient details
    alert(`Patient Details:\n
ID: ${patient.patient_id}
Name: ${patient.patient_name}
Gender: ${patient.patient_gender || "N/A"}
DOB: ${formatDate(patient.patient_dob)}
Contact: ${patient.patient_contact || "N/A"}
Blood Group: ${patient.patient_blood_group || "N/A"}
Height: ${patient.patient_height || "N/A"} cm
Weight: ${patient.patient_weight || "N/A"} kg
Address: ${patient.patient_address || "N/A"}`);
  };

  const handleEditPatient = (patient) => {
    console.log("Editing patient:", patient); // Add this for debugging

    // Correctly map database field names to form field names
    setPatientForm({
      patientId: patient.patient_id,
      patientName: patient.patient_name || "",
      dateOfBirth: patient.patient_dob ? patient.patient_dob.split("T")[0] : "",
      gender: patient.patient_gender || "",
      contactNumber: patient.patient_contact || "", 
      address: patient.patient_address || "", 
      bloodGroup: patient.patient_blood_group || "", 
      height: patient.patient_height || "",
      weight: patient.patient_weight || "",
    });

    // Show the form and scroll to it
    setShowPatientForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Update UI to indicate editing mode
    setPatientSuccess("Editing patient: " + patient.patient_name);
  };
  

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) {
      return;
    }

    try {
      const response = await fetch(`${SERVER_URL}/patients/${patientId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        alert("Patient deleted successfully");
        fetchPatients();
      } else {
        alert(`Failed to delete patient: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting patient:", error);
      alert("An error occurred while deleting the patient");
    }
  };

  const handleViewDoctor = (doctor) => {
    console.log("View doctor details:", doctor);
    alert(`Doctor Details:\n
ID: ${doctor.doctor_id}
Name: ${doctor.doctor_name || "N/A"}
Specialization: ${doctor.doctor_specialization || "N/A"}
DOB: ${formatDate(doctor.doctor_date_of_birth) || "N/A"}
Contact: ${doctor.doctor_contact || "N/A"}
Address: ${doctor.doctor_address || "N/A"}
Status: ${doctor.doctor_is_available ? "Available" : "Unavailable"}`);
  };

  const handleEditDoctor = async (doctor) => {
    console.log("Editing doctor:", doctor);

    // Set form data with correct field names based on your API response
    setDoctorForm({
      doctorId: doctor.doctor_id,
      doctorName: doctor.doctor_name || "",
      dateOfBirth: doctor.doctor_date_of_birth
        ? doctor.doctor_date_of_birth.split("T")[0]
        : "",
      specialization: doctor.doctor_specialization || "",
      contactNumber: doctor.doctor_contact || "",
      gender: doctor.doctor_gender || "",
      address: doctor.doctor_address || "",
      isAvailable: Boolean(doctor.doctor_is_available),
    });

    // Show form and scroll to it
    setShowDoctorForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Update UI to indicate editing mode
    setDoctorSuccess("Editing doctor: " + doctor.doctor_name);
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${SERVER_URL}/doctors/${doctorId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        alert("Doctor deleted successfully");
        fetchDoctors();
      } else {
        alert(`Failed to delete doctor: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting doctor:", error);
      alert("Failed to delete doctor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // Prepare chart data for patient statistics
  const patientGenderChartData = {
    labels: Object.keys(statistics.patientStats.patientsByGender || {}),
    datasets: [
      {
        label: 'Patients by Gender',
        data: Object.values(statistics.patientStats.patientsByGender || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const patientBloodGroupChartData = {
    labels: Object.keys(statistics.patientStats.patientsByBloodGroup || {}),
    datasets: [
      {
        label: 'Patients by Blood Group',
        data: Object.values(statistics.patientStats.patientsByBloodGroup || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(83, 102, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const patientAgeGroupChartData = {
    labels: Object.keys(statistics.patientStats.patientsByAgeGroup || {}),
    datasets: [
      {
        label: 'Patients by Age Group',
        data: Object.values(statistics.patientStats.patientsByAgeGroup || {}),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for doctor statistics
  const doctorSpecializationChartData = {
    labels: Object.keys(statistics.doctorStats.doctorsBySpecialization || {}),
    datasets: [
      {
        label: 'Doctors by Specialization',
        data: Object.values(statistics.doctorStats.doctorsBySpecialization || {}),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for visit statistics
  const visitStatusChartData = {
    labels: Object.keys(statistics.visitStats.visitsByStatus || {}),
    datasets: [
      {
        label: 'Visits by Status',
        data: Object.values(statistics.visitStats.visitsByStatus || {}),
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)', // pending
          'rgba(75, 192, 192, 0.6)', // visited
          'rgba(255, 99, 132, 0.6)', // missed
          'rgba(54, 162, 235, 0.6)', // cancelled
        ],
        borderWidth: 1,
      },
    ],
  };

  const visitMonthlyChartData = {
    labels: Object.keys(statistics.visitStats.visitsByMonth || {}),
    datasets: [
      {
        label: 'Visits by Month',
        data: Object.values(statistics.visitStats.visitsByMonth || {}),
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        tension: 0.1
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
        <h1>Admin Dashboard</h1>
        <p>Manage hospital resources</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${
            activeTab === "patientServices" ? "active" : ""
          }`}
          onClick={() => setActiveTab("patientServices")}
        >
          Patient Services
        </button>
        <button
          className={`tab-button ${
            activeTab === "doctorServices" ? "active" : ""
          }`}
          onClick={() => setActiveTab("doctorServices")}
        >
          Doctor Services
        </button>
        <button
          className={`tab-button ${activeTab === "statistics" ? "active" : ""}`}
          onClick={() => setActiveTab("statistics")}
        >
          Statistics
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "patientServices" && (
          <div className="services-section">
            <div className="section-header">
              <h2>Patient Management</h2>
              <button
                className={`toggle-form-button ${
                  showPatientForm ? "active" : ""
                }`}
                onClick={togglePatientForm}
              >
                {showPatientForm ? "Hide Form" : "Register New Patient"}
              </button>
            </div>

            {showPatientForm && (
              <div className="form-container collapsible">
                <h3>Register New Patient</h3>
                {patientError && (
                  <div className="error-message">{patientError}</div>
                )}
                {patientSuccess && (
                  <div className="success-message">{patientSuccess}</div>
                )}

                <form onSubmit={handlePatientSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="patientName">Full Name*</label>
                      <input
                        type="text"
                        id="patientName"
                        name="patientName"
                        placeholder="John Doe"
                        value={patientForm.patientName}
                        onChange={handlePatientFormChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="dateOfBirth">Date of Birth*</label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={patientForm.dateOfBirth}
                        onChange={handlePatientFormChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="gender">Gender</label>
                      <select
                        id="gender"
                        name="gender"
                        value={patientForm.gender}
                        onChange={handlePatientFormChange}
                      >
                        <option value="">Select gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="contactNumber">Contact Number</label>
                      <input
                        type="tel"
                        id="contactNumber"
                        name="contactNumber"
                        placeholder="1234567890"
                        value={patientForm.contactNumber}
                        onChange={handlePatientFormChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="bloodGroup">Blood Group</label>
                      <select
                        id="bloodGroup"
                        name="bloodGroup"
                        value={patientForm.bloodGroup}
                        onChange={handlePatientFormChange}
                      >
                        <option value="">Select blood group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="height">Height (cm)</label>
                      <input
                        type="number"
                        id="height"
                        name="height"
                        placeholder="175"
                        value={patientForm.height}
                        onChange={handlePatientFormChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="weight">Weight (kg)</label>
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        placeholder="70"
                        value={patientForm.weight}
                        onChange={handlePatientFormChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <textarea
                      id="address"
                      name="address"
                      rows="3"
                      placeholder="Enter patient's address"
                      value={patientForm.address}
                      onChange={handlePatientFormChange}
                    ></textarea>
                  </div>

                  <button type="submit" className="submit-button">
                    Register Patient
                  </button>
                </form>
              </div>
            )}

            <div className="table-section">
              <h3>All Patients</h3>

              {loading ? (
                <div className="loading">Loading patients...</div>
              ) : patients.length === 0 ? (
                <div className="no-data">No patients found in the system.</div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Patient ID</th>
                        <th>Name</th>
                        <th>Date of Birth</th>
                        <th>Gender</th>
                        <th>Contact</th>
                        <th>Blood Group</th>
                        <th>Height</th>
                        <th>Weight</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient) => (
                        <tr key={patient.patient_id}>
                          <td>{patient.patient_id}</td>
                          <td>{patient.patient_name}</td>
                          <td>{formatDate(patient.patient_dob)}</td>
                          <td>{patient.patient_gender || "N/A"}</td>
                          <td>{patient.patient_contact || "N/A"}</td>
                          <td>{patient.patient_blood_group || "N/A"}</td>
                          <td>{patient.patient_height || "N/A"}</td>
                          <td>{patient.patient_weight || "N/A"}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="action-button view-button"
                                onClick={() => handleViewPatient(patient)}
                              >
                                View
                              </button>
                              <button
                                className="action-button edit-button"
                                onClick={() => handleEditPatient(patient)}
                              >
                                Edit
                              </button>
                              <button
                                className="action-button delete-button"
                                onClick={() =>
                                  handleDeletePatient(patient.patient_id)
                                }
                              >
                                Delete
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
          </div>
        )}

        {activeTab === "doctorServices" && (
          <div className="services-section">
            <div className="section-header">
              <h2>Doctor Management</h2>
              <button
                className={`toggle-form-button ${
                  showDoctorForm ? "active" : ""
                }`}
                onClick={toggleDoctorForm}
              >
                {showDoctorForm ? "Hide Form" : "Register New Doctor"}
              </button>
            </div>

            {showDoctorForm && (
              <div className="form-container collapsible">
                <h3>Register New Doctor</h3>
                {doctorError && (
                  <div className="error-message">{doctorError}</div>
                )}
                {doctorSuccess && (
                  <div className="success-message">{doctorSuccess}</div>
                )}

                <form onSubmit={handleDoctorSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="doctorName">Full Name*</label>
                      <input
                        type="text"
                        id="doctorName"
                        name="doctorName"
                        placeholder="Dr. Doctor Name"
                        value={doctorForm.doctorName}
                        onChange={handleDoctorFormChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="dateOfBirth">Date of Birth</label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={doctorForm.dateOfBirth}
                        onChange={handleDoctorFormChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="gender">Gender</label>
                      <select
                        id="gender"
                        name="gender"
                        value={doctorForm.gender}
                        onChange={handleDoctorFormChange}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="others">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="specialization">Specialization*</label>
                      <select
                        id="specialization"
                        name="specialization"
                        value={doctorForm.specialization}
                        onChange={handleDoctorFormChange}
                      >
                        <option value="">Select specialization</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Endocrinology">Endocrinology</option>
                        <option value="Gastroenterology">
                          Gastroenterology
                        </option>
                        <option value="Neurology">Neurology</option>
                        <option value="Obstetrics">Obstetrics</option>
                        <option value="Oncology">Oncology</option>
                        <option value="Ophthalmology">Ophthalmology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Psychiatry">Psychiatry</option>
                        <option value="Pulmonology">Pulmonology</option>
                        <option value="Radiology">Radiology</option>
                        <option value="Urology">Urology</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="contactNumber">Contact Number</label>
                      <input
                        type="tel"
                        id="contactNumber"
                        name="contactNumber"
                        placeholder="1234567890"
                        value={doctorForm.contactNumber}
                        onChange={handleDoctorFormChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <textarea
                      id="address"
                      name="address"
                      rows="3"
                      placeholder="Enter doctor's address"
                      value={doctorForm.address}
                      onChange={handleDoctorFormChange}
                    ></textarea>
                  </div>

                  <div className="form-group checkbox-group">
                    <input
                      type="checkbox"
                      id="isAvailable"
                      name="isAvailable"
                      checked={doctorForm.isAvailable}
                      onChange={handleDoctorFormChange}
                    />
                    <label htmlFor="isAvailable">
                      Doctor is available for appointments
                    </label>
                  </div>

                  <button type="submit" className="submit-button">
                    {doctorForm.doctorId ? "Update Doctor" : "Register Doctor"}
                  </button>
                </form>
              </div>
            )}

            <div className="table-section">
              <h3>All Doctors</h3>

              {loading ? (
                <div className="loading">Loading doctors...</div>
              ) : doctors.length === 0 ? (
                <div className="no-data">No doctors found in the system.</div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Doctor ID</th>
                        <th>Name</th>
                        <th>Specialization</th>
                        <th>Date Of Birth</th>
                        <th>Gender</th>
                        <th>Address</th>
                        <th>Contact</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map((doctor) => (
                        <tr key={doctor.doctor_id}>
                          <td>{doctor.doctor_id}</td>
                          <td>{doctor.doctor_name}</td>
                          <td>{doctor.doctor_specialization || "N/A"}</td>
                          <td>{doctor.doctor_date_of_birth || "N/A"}</td>
                          <td>{doctor.doctor_gender || "N/A"}</td>
                          <td>{doctor.doctor_address || "N/A"}</td>
                          <td>{doctor.doctor_contact || "N/A"}</td>
                          <td>
                            <span
                              className={`status-badge ${
                                doctor.doctor_is_available
                                  ? "status-active"
                                  : "status-inactive"
                              }`}
                            >
                              {doctor.doctor_is_available
                                ? "Available"
                                : "Unavailable"}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="action-button view-button"
                                onClick={() => handleViewDoctor(doctor)}
                              >
                                View
                              </button>
                              <button
                                className="action-button edit-button"
                                onClick={() => handleEditDoctor(doctor)}
                              >
                                Edit
                              </button>
                              <button
                                className="action-button delete-button"
                                onClick={() =>
                                  handleDeleteDoctor(doctor.doctor_id)
                                }
                              >
                                Delete
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
          </div>
        )}

        {activeTab === "statistics" && (
          <div className="statistics-section">
            <h2>Hospital Statistics Dashboard</h2>
            
            {loading ? (
              <div className="loading">Loading statistics...</div>
            ) : (
              <>
                {/* Hospital Overview */}
                <div className="stats-overview">
                  <div className="stat-card">
                    <h3>Total Patients</h3>
                    <p className="stat-value">{statistics.patientStats.totalPatients || 0}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Total Doctors</h3>
                    <p className="stat-value">{statistics.doctorStats.totalDoctors || 0}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Available Doctors</h3>
                    <p className="stat-value">{statistics.doctorStats.availableDoctors || 0}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Total Visits</h3>
                    <p className="stat-value">{statistics.visitStats.totalVisits || 0}</p>
                  </div>
                </div>

                {/* Patient Statistics */}
                <div className="stats-section">
                  <h3>Patient Statistics</h3>
                  <div className="charts-container">
                    <div className="chart-wrapper">
                      <h4>Patients by Gender</h4>
                      <div className="chart pie-chart">
                        <Pie data={patientGenderChartData} options={{ responsive: true }} />
                      </div>
                    </div>
                    <div className="chart-wrapper">
                      <h4>Patients by Blood Group</h4>
                      <div className="chart pie-chart">
                        <Pie data={patientBloodGroupChartData} options={{ responsive: true }} />
                      </div>
                    </div>
                    <div className="chart-wrapper">
                      <h4>Patients by Age Group</h4>
                      <div className="chart">
                        <Bar 
                          data={patientAgeGroupChartData} 
                          options={{
                            responsive: true,
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: { precision: 0 }
                              }
                            }
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Doctor Statistics */}
                <div className="stats-section">
                  <h3>Doctor Statistics</h3>
                  <div className="charts-container">
                    <div className="chart-wrapper">
                      <h4>Doctors by Specialization</h4>
                      <div className="chart">
                        <Bar 
                          data={doctorSpecializationChartData} 
                          options={{
                            responsive: true,
                            indexAxis: 'y',
                            scales: {
                              x: {
                                beginAtZero: true,
                                ticks: { precision: 0 }
                              }
                            }
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visit Statistics */}
                <div className="stats-section">
                  <h3>Visit Statistics</h3>
                  <div className="charts-container">
                    <div className="chart-wrapper">
                      <h4>Visits by Status</h4>
                      <div className="chart pie-chart">
                        <Pie data={visitStatusChartData} options={{ responsive: true }} />
                      </div>
                    </div>
                    <div className="chart-wrapper">
                      <h4>Visits by Month</h4>
                      <div className="chart">
                        <Line 
                          data={visitMonthlyChartData} 
                          options={{
                            responsive: true,
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: { precision: 0 }
                              }
                            }
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="stats-section">
                  <h3>Recent Activity</h3>
                  <div className="activity-container">
                    <div className="activity-card">
                      <h4>Recently Added Patients</h4>
                      {statistics.patientStats.recentlyAddedPatients && 
                       statistics.patientStats.recentlyAddedPatients.length > 0 ? (
                        <ul className="activity-list">
                          {statistics.patientStats.recentlyAddedPatients.map(patient => (
                            <li key={patient.patient_id} className="activity-item">
                              <div className="activity-content">
                                <span className="activity-name">{patient.patient_name}</span>
                                <span className="activity-details">
                                  {patient.patient_gender === 'M' ? 'Male' : 
                                   patient.patient_gender === 'F' ? 'Female' : 'Other'}, 
                                  {' '}{formatDate(patient.patient_dob)}
                                </span>
                              </div>
                              <span className="activity-time">
                                {new Date(patient.patient_updated_at).toLocaleDateString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-data">No recent patients added</p>
                      )}
                    </div>

                    <div className="activity-card">
                      <h4>Recent Visits</h4>
                      {statistics.visitStats.recentVisits && 
                       statistics.visitStats.recentVisits.length > 0 ? (
                        <ul className="activity-list">
                          {statistics.visitStats.recentVisits.map(visit => (
                            <li key={`${visit.patient_id}-${visit.doctor_id}-${visit.date_of_visit}`} className="activity-item">
                              <div className="activity-content">
                                <span className="activity-name">
                                  {visit.patient_name} → Dr. {visit.doctor_name}
                                </span>
                                <span className="activity-details">
                                  {visit.visit_reason}
                                </span>
                              </div>
                              <span className={`status-badge ${getStatusClass(visit.visit_status)}`}>
                                {visit.visit_status}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-data">No recent visits</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
  // Helper function for status classes
  function getStatusClass(status) {
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
  }
}
