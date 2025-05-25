import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/PageStyles.css";

export default function VisitsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'today', 'upcoming', 'completed'

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        // In a real app, fetch from your API
        // const response = await fetch('http://localhost:5001/visits');
        // const data = await response.json();

        // Simulating API response
        setTimeout(() => {
          setVisits([
            {
              visit_id: "v0001",
              patient_name: "John Smith",
              patient_id: "p00001",
              doctor_name: "Dr. Sarah Johnson",
              doctor_id: "d001",
              visit_date: "2025-05-25",
              visit_time: "09:30 AM",
              visit_status: "scheduled",
              visit_reason: "Routine checkup",
            },
            {
              visit_id: "v0002",
              patient_name: "Alice Brown",
              patient_id: "p00002",
              doctor_name: "Dr. Michael Chen",
              doctor_id: "d002",
              visit_date: "2025-05-24",
              visit_time: "02:15 PM",
              visit_status: "completed",
              visit_reason: "Follow-up",
            },
            {
              visit_id: "v0003",
              patient_name: "Robert Wilson",
              patient_id: "p00003",
              doctor_name: "Dr. Emily Rodriguez",
              doctor_id: "d003",
              visit_date: "2025-05-26",
              visit_time: "11:00 AM",
              visit_status: "scheduled",
              visit_reason: "Consultation",
            },
          ]);
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching visits:", error);
        setIsLoading(false);
      }
    };

    fetchVisits();
  }, []);

  // Filter visits based on search term and filter type
  const filteredVisits = visits.filter((visit) => {
    const matchesSearch =
      visit.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.visit_id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const today = new Date().toISOString().split("T")[0];

    switch (filter) {
      case "today":
        return visit.visit_date === today;
      case "upcoming":
        return visit.visit_date > today && visit.visit_status === "scheduled";
      case "completed":
        return visit.visit_status === "completed";
      default:
        return true;
    }
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>Visit Management</h1>
          <p className="subtitle">Schedule and manage patient visits</p>
        </div>
        <Link to="/visits/new" className="primary-button">
          <i className="fas fa-plus"></i> Schedule New Visit
        </Link>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Visits
        </button>
        <button
          className={`filter-tab ${filter === "today" ? "active" : ""}`}
          onClick={() => setFilter("today")}
        >
          Today
        </button>
        <button
          className={`filter-tab ${filter === "upcoming" ? "active" : ""}`}
          onClick={() => setFilter("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`filter-tab ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2>Visit Records</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search visits..."
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
            <div className="loading-indicator">Loading visit data...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Visit ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No visits found
                    </td>
                  </tr>
                ) : (
                  filteredVisits.map((visit) => (
                    <tr key={visit.visit_id}>
                      <td>{visit.visit_id}</td>
                      <td>{visit.patient_name}</td>
                      <td>{visit.doctor_name}</td>
                      <td>
                        {visit.visit_date} at {visit.visit_time}
                      </td>
                      <td>{visit.visit_reason}</td>
                      <td>
                        <span
                          className={`status-badge status-${visit.visit_status}`}
                        >
                          {visit.visit_status.charAt(0).toUpperCase() +
                            visit.visit_status.slice(1)}
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
