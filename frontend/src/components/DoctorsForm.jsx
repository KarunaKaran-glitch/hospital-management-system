import { useState } from "react";
import "../index.css";

export default function DoctorsForm() {
  const [formData, setFormData] = useState({
    doctorName: "",
    doctorspecialization: "",
    doctorContact: "",
    doctorAddress: "",
    doctorIsAvailable: true,
    doctorGender: "", // <-- Add this line
  });

  const [errors, setErrors] = useState({});

  // Handle all input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // Form validation
  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.doctorName.trim()) {
      tempErrors.doctorName = "Doctor name is required";
      isValid = false;
    }

    if (!formData.doctorspecialization.trim()) {
      tempErrors.doctorspecialization = "Specialization is required";
      isValid = false;
    }

    if (!formData.doctorContact.trim()) {
      tempErrors.doctorContact = "Contact number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.doctorContact)) {
      tempErrors.doctorContact = "Contact must be 10 digits";
      isValid = false;
    }

    if (!formData.doctorAddress.trim()) {
      tempErrors.doctorAddress = "Address is required";
      isValid = false;
    }

    if (!formData.doctorGender) {
      tempErrors.doctorGender = "Gender is required";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Submit form data to API
      console.log("Form submitted:", formData);
      // API call would go here

      // Reset form after submission
      setFormData({
        doctorName: "",
        doctorspecialization: "",
        doctorContact: "",
        doctorAddress: "",
        doctorIsAvailable: true,
        doctorGender: "" // <-- Add this
      });
    }
  };

  // List of specializations
  const specializations = [
    "Cardiology",
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "Neurology",
    "Obstetrics & Gynecology",
    "Oncology",
    "Ophthalmology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Radiology",
    "Urology"
  ];

  return (
    <div className="doctor-form-container">
      <form className="doctor-form" onSubmit={handleSubmit}>
        <h2>Doctor Registration</h2>
        
        <div className="form-group">
          <label htmlFor="doctorName">Doctor Name</label>
          <input
            id="doctorName"
            name="doctorName"
            type="text"
            value={formData.doctorName}
            placeholder="Enter full name"
            onChange={handleChange}
            className={errors.doctorName ? "error-input" : ""}
          />
          {errors.doctorName && <div className="error-message">{errors.doctorName}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="doctorspecialization">Specialization</label>
          <select
            id="doctorspecialization"
            name="doctorspecialization"
            value={formData.doctorspecialization}
            onChange={handleChange}
            className={errors.doctorspecialization ? "error-input" : ""}
          >
            <option value="">Select specialization</option>
            {specializations.map((specialization) => (
              <option key={specialization} value={specialization}>
                {specialization}
              </option>
            ))}
          </select>
          {errors.doctorspecialization && <div className="error-message">{errors.doctorspecialization}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="doctorContact">Contact Number</label>
          <input
            id="doctorContact"
            name="doctorContact"
            type="text"
            value={formData.doctorContact}
            placeholder="Enter 10-digit number"
            onChange={handleChange}
            className={errors.doctorContact ? "error-input" : ""}
          />
          {errors.doctorContact && <div className="error-message">{errors.doctorContact}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="doctorAddress">Address</label>
          <textarea
            id="doctorAddress"
            name="doctorAddress"
            value={formData.doctorAddress}
            placeholder="Enter full address"
            onChange={handleChange}
            rows="3"
            className={errors.doctorAddress ? "error-input" : ""}
          />
          {errors.doctorAddress && <div className="error-message">{errors.doctorAddress}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="doctorGender">Gender</label>
          <select
            id="doctorGender"
            name="doctorGender"
            value={formData.doctorGender}
            onChange={handleChange}
            className={errors.doctorGender ? "error-input" : ""}>
            <option value="">Select gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
          {errors.doctorGender && <div className="error-message">{errors.doctorGender}</div>}
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="doctorIsAvailable"
              checked={formData.doctorIsAvailable}
              onChange={handleChange}
            />
            Available for appointments
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">Register Doctor</button>
          <button type="button" className="reset-btn" onClick={() => {
            setFormData({
              doctorName: "",
              doctorspecialization: "",
              doctorContact: "",
              doctorAddress: "",
              doctorIsAvailable: true,
              doctorGender: ""
            });
            setErrors({});
          }}>
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
}
