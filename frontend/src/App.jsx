import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PatientsPage from "./pages/PatientsPage";
import DoctorsPage from "./pages/DoctorsPage";
import VisitsPage from "./pages/VisitsPage";
import PatientForm from "./components/PatientForm";
import DoctorForm from "./components/DoctorsForm";

import "./App.css";
import "./index.css";
import "./styles/LoginPage.css";

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/new" element={<PatientForm />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/doctors/new" element={<DoctorForm />} />
            <Route path="/visits" element={<VisitsPage />} />
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
