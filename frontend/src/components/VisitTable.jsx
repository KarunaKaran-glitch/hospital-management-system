import { useState, useEffect } from "react";
import SERVER_URL from "../lib/constants";

export default function VisitTable() {
  const [visits, SetVisits] = useState([]);

  useEffect(() => {
    const fetchvisits = async () => {
      const response = await fetch(`${SERVER_URL}/visits`);
      if (!response.ok) {
        const data = await response.json();
        console.log(data);
      }
      const patients = await response.json();
      SetVisits(patients);
    };

    fetchvisits();
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Visit PatientID</th>
          <th>Visit DoctorId</th>
          <th>Visit DateOfVisit</th>
          <th>Visit Status</th>
          <th>Visit ReportId</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(visits) &&
          visits.map((visit, index) => {
            return (
              <tr key={index}>
                <td>{visit.patient_id}</td>
                <td>{visit.doctor_id}</td>
                <td>{visit.date_of_visit}</td>
                <td>{visit.visit_status}</td>
                <td>{visit.report_id}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}
