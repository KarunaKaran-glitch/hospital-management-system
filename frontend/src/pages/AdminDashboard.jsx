import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("patientServices");
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const SERVER_URL = "http://localhost:5001";
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

    try {
      const response = await fetch(`${SERVER_URL}/doctors`, {
        method: "POST",
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
        setDoctorSuccess(`Doctor created successfully with ID: ${data.data}!`);
        setDoctorForm({
          doctorName: "",
          dateOfBirth: "",
          specialization: "",
          contactNumber: "",
          gender: "",
          address: "",
          isAvailable: true,
        });
        // Refresh the doctor list
        fetchDoctors();
      } else {
        setDoctorError(data.message || "Failed to create doctor");
      }
    } catch (error) {
      console.error("Error creating doctor:", error);
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
    // Set patient form data
    setPatientForm({
      patientId: patient.patient_id,
      patientName: patient.patient_name || "",
      dateOfBirth: patient.patient_dob ? patient.patient_dob.split("T")[0] : "",
      gender: patient.gender || "",
      contactNumber: patient.contact_number || "",
      address: patient.address || "",
      bloodGroup: patient.blood_group || "",
      height: patient.height || "",
      weight: patient.weight || "",
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

  const handleEditDoctor = (doctor) => {
    console.log("Editing doctor:", doctor);

    // Set form data with correct field names based on your API response
    setDoctorForm({
      doctorId: doctor.doctor_id,
      doctorName: doctor.doctor_name || "",
      dateOfBirth: doctor.doctor_dob ? doctor.doctor_dob.split("T")[0] : "",
      specialization: doctor.doctor_specialization || "",
      contactNumber: doctor.doctor_contact || "",
      gender: doctor.doctor_gender || "",
      address: doctor.address || "",
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage hospital resources</p>
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
                        placeholder="Dr. Jane Smith"
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
                        <option value="other">Other</option>
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
                    Register Doctor
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
      </div>

      <div className="logout-container">
        <button className="logout-button" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </div>
  );
}
