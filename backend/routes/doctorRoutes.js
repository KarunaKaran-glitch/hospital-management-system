import { Router } from "express";
import pool from "../db.js";

const doctorRoutes = Router();

doctorRoutes.get("/", async (req, res) => {
  try {
    const allDoctors = await pool.query(
      "SELECT * FROM doctor ORDER BY doctor_id"
    );
    res.json(allDoctors.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

doctorRoutes.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("Select * from doctor where doctor_id=$1", [
      id,
    ]);
    const doctor = result.rows;
    if (doctor.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }
    return res.status(200).json({ success: true, message: doctor });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

doctorRoutes.post("/", async (req, res) => {
  try {
    const { doctorName, doctorSpecialist, contactNumber, address } = req.body;

    // Validate required fields
    if (!doctorName || !doctorSpecialist || !contactNumber || !address) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: doctorName, doctorSpecialist, contactNumber, and address are required.",
      });
    }

    const latestDoctorQuery = await pool.query(
      "SELECT doctor_id FROM doctor ORDER BY doctor_id DESC LIMIT 1"
    );

    let newDoctorId;

    if (latestDoctorQuery.rows.length === 0) {
      newDoctorId = "d001";
    } else {
      const latestId = latestDoctorQuery.rows[0].doctor_id;
      const numericPart = parseInt(latestId.substring(1), 10);
      const nextNumericPart = numericPart + 1;
      newDoctorId = `d${nextNumericPart.toString().padStart(3, "0")}`;
    }

    // Insert new doctor with the generated ID
    const result = await pool.query(
      `INSERT INTO doctor (
        doctor_id, doctor_name, doctor_specalist, doctor_contact, 
        doctor_address, doctor_is_available
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        newDoctorId,
        doctorName,
        doctorSpecialist,
        contactNumber,
        address,
        true, // Default to available
      ]
    );

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating doctor:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

doctorRoutes.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      doctorName,
      doctorSpecialist,
      address,
      contactNumber,
      doctorIsAvailable,
    } = req.body;

    // First check if the doctor exists
    const checkDoctor = await pool.query(
      "SELECT * FROM doctor WHERE doctor_id = $1",
      [id]
    );

    if (checkDoctor.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Validate required fields if any are mandatory for an update
    if (
      !doctorName &&
      !doctorSpecialist &&
      !address &&
      !contactNumber &&
      typeof doctorIsAvailable === "undefined"
    ) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update.",
      });
    }

    // Construct the SET part of the SQL query dynamically
    const fieldsToUpdate = {};
    if (doctorName !== undefined) fieldsToUpdate.doctor_name = doctorName;
    if (doctorSpecialist !== undefined)
      fieldsToUpdate.doctor_specalist = doctorSpecialist;
    if (address !== undefined) fieldsToUpdate.doctor_address = address;
    if (contactNumber !== undefined)
      fieldsToUpdate.doctor_contact = contactNumber;
    if (typeof doctorIsAvailable !== "undefined")
      fieldsToUpdate.doctor_is_available = doctorIsAvailable;

    const fieldKeys = Object.keys(fieldsToUpdate);
    if (fieldKeys.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    const setClauses = fieldKeys
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");
    const values = [id, ...fieldKeys.map((key) => fieldsToUpdate[key])];

    const query = `UPDATE doctor SET ${setClauses} WHERE doctor_id = $1 RETURNING *`;

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

doctorRoutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^d\d{3}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID format. Must be 'd' followed by 3 digits.",
      });
    }

    // Check for foreign key constraints before deletion
    const checkVisitRelationships = await pool.query(
      "SELECT COUNT(*) FROM visit WHERE doctor_id = $1",
      [id]
    );

    if (parseInt(checkVisitRelationships.rows[0].count) > 0) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete doctor because they have associated reports",
      });
    }

    // Delete the doctor
    const deleteResult = await pool.query(
      "DELETE FROM doctor WHERE doctor_id = $1 RETURNING *",
      [id]
    );

    // Check if any rows were actually deleted
    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
      data: deleteResult.rows[0],
    });
  } catch (error) {
    console.error("Error deleting doctor:", error);

    // Check for foreign key violation
    if (error.code === "23503") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete doctor because they have related records",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

export default doctorRoutes;
