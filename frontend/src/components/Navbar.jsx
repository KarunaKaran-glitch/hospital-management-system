import { Link } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/patients" className="nav-link">
              Patients
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/doctors" className="nav-link">
              Doctors
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/visits" className="nav-link">
              Visits
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
