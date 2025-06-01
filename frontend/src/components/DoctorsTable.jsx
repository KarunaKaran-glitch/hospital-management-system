import { useState, useEffect } from "react";
import SERVER_URL from "../lib/constants";

export default function DoctorsTable() {
  const [doctors, SetDoctors] = useState([]);

  useEffect(() => {
    const fetchdoctors = async () => {
      const response = await fetch(`${SERVER_URL}/doctors`);
      if (!response.ok) {
        const data = await response.json();
        console.log(data);
      }
      const patients = await response.json();
      SetDoctors(patients);
    };

    fetchdoctors();
  }, []);

  const handleEdit = () => {};

  const handleDelete = () => {};

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Doctor ID</th>
          <th>Name</th>
          <th>Gender</th>
          <th>Specalist</th>
          <th>Address</th>
          <th>Contact Number</th>
          <th>Availability</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(doctors) &&
          doctors.map((doctor, index) => {
            return (
              <tr key={index}>
                <td>{doctor.doctor_id}</td>
                <td>{doctor.doctor_name}</td>
                <td>{doctor.doctor_gender}</td>
                <td>{doctor.doctor_specalist}</td>
                <td>{doctor.doctor_address}</td>
                <td>{doctor.doctor_constant}</td>
                <td>{doctor.doctor_isavailable}</td>
                <td>
                  {
                    <>
                      <button onClick={handleEdit}>Edit</button>
                      <button onClick={handleDelete}>Delete</button>
                    </>
                  }
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}