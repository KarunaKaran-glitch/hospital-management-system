import { useState, useEffect } from "react";
import SERVER_URL from "../lib/constants";

export default function ReportTable() {
  const [reports, SetReports] = useState([]);

  useEffect(() => {
    const fetchreports = async () => {
      const response = await fetch(`${SERVER_URL}/reports`);
      if (!response.ok) {
        const data = await response.json();
        console.log(data);
      }
      const patients = await response.json();
      SetReports(patients);
    };

    fetchreports();
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Report Id</th>
          <th>Report DateOfVisit</th>
          <th>Report PatientId</th>
          <th>Report DoctorId</th>
          <th>Report DoctorRemarks</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(reports) &&
          reports.map((report, index) => {
            return (
              <tr key={index}>
                <td>{report.report_id}</td>
                <td>{report.dateofvisit}</td>
                <td>{report.patient_id}</td>
                <td>{report.doctor_id}</td>
                <td>{report.doctor_remarks}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}
