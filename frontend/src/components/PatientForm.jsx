import { useState } from "react";
import SERVER_URL from "../lib/constants.js";
import "../App.css";

export default function PatientForm() {
  const [formData, setFormData] = useState({
    patientName: "",
    patientDob: "",
    patientAddress: "",
    patientContact: "",
    patientGender: "",
    patientBloodGroup: "",
    patientWeight: "",
    patientHeight: "",
  });

  const [errors, setErrors] = useState({});

  // Handle all input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Form validation
  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.patientName.trim()) {
      tempErrors.patientName = "Name is required";
      isValid = false;
    }

    if (!formData.patientDob) {
      tempErrors.patientDob = "Date of birth is required";
      isValid = false;
    }

    if (!formData.patientAddress.trim()) {
      tempErrors.patientAddress = "Address is required";
      isValid = false;
    }

    if (!formData.patientContact.trim()) {
      tempErrors.patientContact = "Contact is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.patientContact)) {
      tempErrors.patientContact = "Contact must be 10 digits";
      isValid = false;
    }

    if (!formData.patientGender) {
      tempErrors.patientGender = "Gender is required";
      isValid = false;
    }

    if (!formData.patientBloodGroup) {
      tempErrors.patientBloodGroup = "Blood group is required";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      const response = await fetch(`${SERVER_URL}/patients`, {
        "Content-Type": "application/json",
        body: JSON.stringify({
          patientName: formData.patientName,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          contactNumber: formData.contactNumber,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          weight: formData.weight,
          height: formData.height,
        }),
      });
      if (!response.ok) {
        const data = await response.body();
        console.log(data.message);
        return;
      }
      alert("Registration success!");
    }
  };

  return (
    <div>
      <form className="form-container" onSubmit={handleSubmit}>
        <h2>Patient Registration</h2>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="patientName">Patient Name:</label>
            <input
              id="patientName"
              name="patientName"
              type="text"
              value={formData.patientName}
              placeholder="Enter patient name"
              onChange={handleChange}
            />
            {errors.patientName && (
              <div className="error-message">{errors.patientName}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="patientDob">Date of Birth:</label>
            <input
              id="patientDob"
              name="patientDob"
              type="date"
              value={formData.patientDob}
              onChange={handleChange}
            />
            {errors.patientDob && (
              <div className="error-message">{errors.patientDob}</div>
            )}
          </div>
        </div>

        <label htmlFor="patientAddress">Address:</label>
        <input
          id="patientAddress"
          name="patientAddress"
          type="text"
          value={formData.patientAddress}
          placeholder="Enter patient address"
          onChange={handleChange}
        />
        {errors.patientAddress && (
          <div className="error-message">{errors.patientAddress}</div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="patientContact">Contact Number:</label>
            <input
              id="patientContact"
              name="patientContact"
              type="text"
              value={formData.patientContact}
              placeholder="Enter 10-digit number"
              onChange={handleChange}
            />
            {errors.patientContact && (
              <div className="error-message">{errors.patientContact}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="patientGender">Gender:</label>
            <select
              id="patientGender"
              name="patientGender"
              value={formData.patientGender}
              onChange={handleChange}
            >
              <option value="">Select gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
            {errors.patientGender && (
              <div className="error-message">{errors.patientGender}</div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="patientBloodGroup">Blood Group:</label>
            <select
              id="patientBloodGroup"
              name="patientBloodGroup"
              value={formData.patientBloodGroup}
              onChange={handleChange}
            >
              <option value="">Select blood group</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
            {errors.patientBloodGroup && (
              <div className="error-message">{errors.patientBloodGroup}</div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="patientHeight">Height (cm):</label>
            <input
              id="patientHeight"
              name="patientHeight"
              type="number"
              value={formData.patientHeight}
              placeholder="Enter height"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="patientWeight">Weight (kg):</label>
            <input
              id="patientWeight"
              name="patientWeight"
              type="number"
              value={formData.patientWeight}
              placeholder="Enter weight"
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit">Register Patient</button>
      </form>
    </div>
  );
}
