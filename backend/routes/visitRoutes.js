import { Router } from "express";
import pool from "../db.js";

const visitRoutes = Router();

visitRoutes.get("/", async (req, res) => {
  try {
    const allVisits = await pool.query("SELECT * FROM visit");
    res.json(allVisits.rows);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

visitRoutes.get("/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;

    const isDoctorQuery = await pool.query(
      `
      SELECT *
      FROM doctor
      WHERE doctor_id = $1
      `,
      [doctorId]
    );

    if (isDoctorQuery.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const allVisitsQuery = await pool.query(
      `
      SELECT *
      FROM visit
      WHERE doctor_id=$1 AND visit_status='pending'
      `,
      [doctorId]
    );

    if (allVisitsQuery.rowCount === 0) {
      return res.status(200).json({
        success: true,
        message: "No appointments found",
      });
    }

    return res.status(200).json({
      success: true,
      message: allVisitsQuery.rows,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error });
  }
});

visitRoutes.post("/", async (req, res) => {
  try {
    const { patientId, doctorId, dateOfVisit } = req.body;

    if (!patientId || !doctorId || !dateOfVisit) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const findPatientQuery = await pool.query(
      `
      SELECT *
      FROM patient
      WHERE patient_id=$1
      `,
      [patientId]
    );

    if (findPatientQuery.rowCount === 0) {
      return res.status(404).json({
        message: "Patient not found",
        success: false,
      });
    }

    const findDoctorQuery = await pool.query(
      `
      SELECT * 
      FROM doctor
      WHERE doctor_id=$1
      `,
      [doctorId]
    );

    if (findDoctorQuery.rowCount === 0) {
      return res.status(404).json({
        message: "Doctor not found",
        success: false,
      });
    }

    if (!findDoctorQuery.rows[0].doctor_is_available) {
      return res.status(404).json({
        message: "Doctor is not available",
        success: false,
      });
    }

    const appointmentCreationQuery = await pool.query(
      `
      INSERT INTO visit (patient_id, doctor_id, date_of_visit, visit_status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING *
      `,
      [patientId, doctorId, dateOfVisit]
    );

    if (appointmentCreationQuery.rowCount === 1) {
      return res.status(201).json({
        success: true,
        message: "Appointment created",
      });
    }

    return res.status(404).json({
      success: false,
      message: "Appointment creation failed",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error,
    });
  }
});

visitRoutes.put("/updateStatus/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;
    const { doctorId, dateOfVisit, visitStatus, reportId, doctorRemarks } =
      req.body;

    if (!patientId || !doctorId || !visitStatus || !dateOfVisit) {
      return res.status(400).json({
        success: false,
        message: "Invalid field provided",
      });
    }

    if (visitStatus === "visited" && (!reportId || !doctorRemarks)) {
      return res.status(400).json({
        success: false,
        message: "Report Id and remarks needed to mark visited",
      });
    }

    const findAppointmentQuery = await pool.query(
      `
      SELECT * 
      FROM VISIT
      WHERE patient_id=$1 AND doctor_id=$2 AND date_of_visit=$3
      `,
      [patientId, doctorId, dateOfVisit]
    );

    if (findAppointmentQuery.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No appointment found to update",
      });
    }

    if (visitStatus === "visited") {
      const latestReportQuery = await pool.query(`
        SELECT report_id
        FROM report
        ORDER BY report_id
        DESC
        LIMIT 1
        `);

      let newReportId;

      if (latestReportQuery.rowCount === 0) {
        newReportId = "R0000000001";
      } else {
        nextNumericalPart =
          parseInt(latestReportQuery.rows[0].report_id.substring(1)) + 1;
        newReportId = `R${nextNumericalPart.toString().padStart(10, "0")}`;
      }

      const createReportQuery = await pool.query(
        `
        INSERT INTO report (report_id, patient_id, doctor_id, date_of_visit, doctor_remarks)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `[(newReportId, patientId, doctorId, dateOfVisit, doctorRemarks)]
      );

      if (createReportQuery.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Report creation failed",
        });
      }

      const updateAppointmentQuery = await pool.query(
        `
        UPDATE visit
        SET visit_status='visited' AND report_id = $1
        WHERE doctor_id=$2 AND patient_id=$3 AND date_of_visit=$4
        RETURNING *
        `,
        [newReportId, doctorId, patientId, dateOfVisit]
      );

      if (updateAppointmentQuery.rowCount === 0) {
        return res.status(401).json({
          success: false,
          message: "Appointment update failed",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Appointment updated",
        data: updateAppointmentQuery.rows[0],
      });
    } else {
      const updateAppointmentQuery = await pool.query(
        `
        UPDATE visit
        SET visit_status ='visited'
        WHERE doctor_id=$1 AND patient_id=$2 AND date_of_visit=$3
        RETURNING *
        `,
        [doctorId, patientId, dateOfVisit]
      );

      if (updateAppointmentQuery.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Update failed",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Appointment updated",
        data: updateAppointmentQuery.rows[0],
      });
    }
  } catch (error) {}
});
export default visitRoutes;
