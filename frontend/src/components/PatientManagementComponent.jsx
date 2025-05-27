import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PatientTable from "../components/PatientTable";
import "../styles/PageStyles.css";

export default function PatientManagementComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [totalPatients, setTotalPatients] = useState(0);

  useEffect(() => {
    const fetchReports = async () => {};

    fetchReports();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>Patient Management</h1>
          <p className="subtitle">Manage patient records and information</p>
        </div>
        <Link to="/patients/new" className="primary-button">
          <i className="fas fa-plus"></i> Add New Patient
        </Link>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon patient-icon">
            <i className="fas fa-user-injured"></i>
          </div>
          <div className="stat-details">
            <h3>Total Patients</h3>
            <p className="stat-number">{isLoading ? "..." : totalPatients}</p>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2>Patient Records</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search patients..."
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
            <div className="loading-indicator">Loading patient data...</div>
          ) : (
            <PatientTable searchTerm={searchTerm} />
          )}
        </div>
      </div>
    </div>
  );
}
