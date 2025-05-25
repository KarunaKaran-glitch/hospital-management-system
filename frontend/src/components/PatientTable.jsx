import { useState, useEffect } from "react";
import SERVER_URL from "../lib/constants.js";

export default function PatientTable() {
  const [patients, SetPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const response = await fetch(`${SERVER_URL}/patients`);
      if (!response.ok) {
        const data = await response.json();
        console.log(data);
      }
      const patients = await response.json();
      SetPatients(patients);
    };

    fetchPatients();
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th> ID</th>
          <th> Name</th>
          <th> Date of Birth</th>
          <th> Address</th>
          <th> Constant</th>
          <th> Gender</th>
          <th> Blood Group</th>
          <th> Weight</th>
          <th> Height</th>
          <th> Updated At</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(patients) &&
          patients.map((patient, index) => {
            return (
              <tr key={index}>
                <td>{patient.patient_id}</td>
                <td>{patient.patient_name}</td>
                <td>{patient.patient_dob}</td>
                <td>{patient.patient_address}</td>
                <td>{patient.patient_contact}</td>
                <td>{patient.patient_gender}</td>
                <td>{patient.patient_blood_group}</td>
                <td>{patient.patient_weight}</td>
                <td>{patient.patient_height}</td>
                <td>{patient.patient_updated_at}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}
