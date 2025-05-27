import { Router } from "express";
import pool from "../db.js";

const loginRoutes = Router();

loginRoutes.post("/doctor", async (req, res) => {
  try {
    const { doctorId, doctorDateOfBirth } = req.body;

    if (!doctorId || !doctorDateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "Doctor Id and Date of Birth are required",
      });
    }

    const doctorFindingQuery = await pool.query(
      `
      SELECT doctor_id, doctor_date_of_birth
      FROM doctor
      WHERE doctor_id=$1
      `,
      [doctorId]
    );

    if (doctorFindingQuery.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor Id not found" });
    }

    const doctor = doctorFindingQuery.rows[0];
    if (
      doctor.doctor_date_of_birth.toLocaleDateString("en-IN") ===
      doctorDateOfBirth
    ) {
      return res.status(200).json({
        success: true,
        message: `${doctorId} Login success`,
      });
    }

    res.status(403).json({
      success: false,
      message: "Invalid Date of Birth",
    });
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      return res.status(500).json({
        success: false,
        message: "Database is unreachable",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error,
    });
  }
});

loginRoutes.post("/patient", async (req, res) => {
  try {
    const { patientId, patientDateOfBirth } = req.body;

    if (!patientId || !patientDateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "patient Id and Date of Birth are required",
      });
    }

    const patientFindingQuery = await pool.query(
      `
      SELECT patient_id, patient_dob
      FROM patient
      WHERE patient_id=$1
      `,
      [patientId]
    );

    if (patientFindingQuery.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Patient Id not found" });
    }

    const patient = patientFindingQuery.rows[0];
    if (
      patient.patient_dob.toLocaleDateString("en-IN") === patientDateOfBirth
    ) {
      return res.status(200).json({
        success: true,
        message: `${patientId} Login success`,
      });
    }

    res.status(403).json({
      success: false,
      message: "Invalid Date of Birth",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default loginRoutes;
