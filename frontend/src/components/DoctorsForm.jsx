import { useState } from "react";
import "../index.css";

export default function DoctorsForm() {
  const [formData, setFormData] = useState({
    doctorName: "",
    doctorSpecialist: "",
    doctorContact: "",
    doctorAddress: "",
    doctorIsAvailable: true
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

    if (!formData.doctorSpecialist.trim()) {
      tempErrors.doctorSpecialist = "Specialization is required";
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
        doctorSpecialist: "",
        doctorContact: "",
        doctorAddress: "",
        doctorIsAvailable: true
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
          <label htmlFor="doctorSpecialist">Specialization</label>
          <select
            id="doctorSpecialist"
            name="doctorSpecialist"
            value={formData.doctorSpecialist}
            onChange={handleChange}
            className={errors.doctorSpecialist ? "error-input" : ""}
          >
            <option value="">Select specialization</option>
            {specializations.map((specialization) => (
              <option key={specialization} value={specialization}>
                {specialization}
              </option>
            ))}
          </select>
          {errors.doctorSpecialist && <div className="error-message">{errors.doctorSpecialist}</div>}
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
              doctorSpecialist: "",
              doctorContact: "",
              doctorAddress: "",
              doctorIsAvailable: true
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
