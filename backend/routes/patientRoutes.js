import { Router } from "express";
import pool from "../db.js";

const patientRoutes = Router();

patientRoutes.get("/", async (req, res) => {
  try {
    const allPatients = await pool.query("SELECT * FROM patient");
    res.status(200).json({
      success: true,
      message: allPatients.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

patientRoutes.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "Select * from patient where patient_id=$1",
      [id]
    );
    const patient = result.rows;
    if (patient.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }
    return res.status(200).json({ success: true, message: patient });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

patientRoutes.post("/", async (req, res) => {
  try {
    const {
      patientName,
      dateOfBirth,
      address,
      contactNumber,
      gender,
      bloodGroup,
      weight,
      height,
    } = req.body;

    // Validate required fields
    if (
      !patientName ||
      !dateOfBirth ||
      !address ||
      !contactNumber ||
      !gender ||
      !bloodGroup
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const latestPatientQuery = await pool.query(
      "SELECT patient_id FROM patient ORDER BY patient_id DESC LIMIT 1"
    );

    let newPatientId;

    if (latestPatientQuery.rows.length === 0) {
      newPatientId = "p00001";
    } else {
      const latestId = latestPatientQuery.rows[0].patient_id;
      const numericPart = parseInt(latestId.substring(1), 10);
      const nextNumericPart = numericPart + 1;
      newPatientId = `p${nextNumericPart.toString().padStart(5, "0")}`;
    }

    const currentTimestamp = new Date();

    // Insert new patient with the generated ID
    const result = await pool.query(
      `INSERT INTO patient (
        patient_id, patient_name, patient_dob, patient_address, 
        patient_contact, patient_gender, patient_blood_group, 
        patient_height, patient_weight, patient_updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        newPatientId,
        patientName,
        dateOfBirth,
        address,
        contactNumber,
        gender,
        bloodGroup,
        height || null,
        weight || null,
        currentTimestamp,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

patientRoutes.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      patientName,
      dateOfBirth,
      address,
      contactNumber,
      gender,
      bloodGroup,
      weight,
      height,
    } = req.body;
    const findPatientQuery = await pool.query(
      `
      SELECT *
      FROM patient
      WHERE patient_id=$1
      `,
      [id]
    );
    const patientRecord = findPatientQuery.rows[0];
    if (!patientRecord) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }
    const currentTimestamp = new Date();

    let updateFields = [];
    let queryParams = [];
    let paramIndex = 1;

    if (patientName !== undefined) {
      console.log("here");
      updateFields.push(`patient_name = $${paramIndex++}`);
      queryParams.push(patientName);
    }

    if (dateOfBirth !== undefined) {
      updateFields.push(`patient_dob = $${paramIndex++}`);
      queryParams.push(dateOfBirth);
    }

    if (address !== undefined) {
      updateFields.push(`patient_address = $${paramIndex++}`);
      queryParams.push(address);
    }

    if (contactNumber !== undefined) {
      updateFields.push(`patient_contact = $${paramIndex++}`);
      queryParams.push(contactNumber);
    }

    if (gender !== undefined) {
      updateFields.push(`patient_gender = $${paramIndex++}`);
      queryParams.push(gender);
    }
    if (bloodGroup !== undefined) {
      updateFields.push(`patient_blood_group = $${paramIndex++}`);
      queryParams.push(bloodGroup);
    }

    if (weight !== undefined) {
      updateFields.push(`patient_weight = $${paramIndex++}`);
      queryParams.push(weight);
    }

    if (height !== undefined) {
      updateFields.push(`patient_height = $${paramIndex++}`);
      queryParams.push(height);
    }

    updateFields.push(`patient_updated_at = $${paramIndex++}`);
    queryParams.push(currentTimestamp);

    queryParams.push(id);

    if (updateFields.length === 1) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }
    const updateQuery = `
        UPDATE patient 
        SET ${updateFields.join(", ")} 
        WHERE patient_id = $${paramIndex}
        RETURNING *
      `;

    const result = await pool.query(updateQuery, queryParams);

    res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

patientRoutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const findPatientQuery = await pool.query(
      "SELECT * FROM patient WHERE patient_id = $1",
      [id]
    );

    if (findPatientQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    await pool.query("DELETE FROM patient WHERE patient_id = $1", [id]);

    res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

export default patientRoutes;
