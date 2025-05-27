import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import SERVER_URL from "../lib/constants";

import "../styles/PageStyles.css";

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/doctors`);
        const data = await response.json();
        setDoctors(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.doctor_specalist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>Doctor Management</h1>
          <p className="subtitle">
            Manage doctor information and specializations
          </p>
        </div>
        <Link to="/doctors/new" className="primary-button">
          <i className="fas fa-plus"></i> Add New Doctor
        </Link>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon doctor-icon">
            <i className="fas fa-user-md"></i>
          </div>
          <div className="stat-details">
            <h3>Total Doctors</h3>
            <p className="stat-number">{isLoading ? "..." : doctors.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon available-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-details">
            <h3>Available</h3>
            <p className="stat-number">
              {isLoading
                ? "..."
                : doctors.filter((doc) => doc.doctor_is_available).length}
            </p>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2>Doctor Directory</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search doctors by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>

        <div className="table-container">
          {isLoading ? (
            <div className="loading-indicator">Loading doctor data...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No doctors found
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <tr key={doctor.doctor_id}>
                      <td>{doctor.doctor_id}</td>
                      <td>{doctor.doctor_name}</td>
                      <td>{doctor.doctor_specalist}</td>
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
                            className="icon-button view-button"
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="icon-button edit-button"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="icon-button delete-button"
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
