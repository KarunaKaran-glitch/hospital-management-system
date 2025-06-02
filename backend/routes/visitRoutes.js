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

visitRoutes.get("/doctor/:doctorId/allPending", async (req, res) => {
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

visitRoutes.get("/doctor/:doctorId/today", async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Verify doctor exists
    const isDoctorQuery = await pool.query(
      `SELECT * FROM doctor WHERE doctor_id = $1`,
      [doctorId]
    );

    if (isDoctorQuery.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Use PostgreSQL's DATE function to compare only the date part
    const todayVisitsQuery = await pool.query(
      `
      SELECT v.*, p.patient_name 
      FROM visit v
      JOIN patient p ON v.patient_id = p.patient_id
      WHERE v.doctor_id = $1 
      AND DATE(v.date_of_visit) = CURRENT_DATE
      ORDER BY v.date_of_visit ASC
      `,
      [doctorId]
    );

    return res.status(200).json({
      success: true,
      message: "Today's appointments retrieved successfully",
      data: todayVisitsQuery.rows,
    });
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

visitRoutes.get("/doctor/:doctorId/upcoming", async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Verify doctor exists
    const isDoctorQuery = await pool.query(
      `SELECT * FROM doctor WHERE doctor_id = $1`,
      [doctorId]
    );

    if (isDoctorQuery.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Use PostgreSQL's DATE function to get future dates only
    const upcomingVisitsQuery = await pool.query(
      `
      SELECT v.*, p.patient_name 
      FROM visit v
      JOIN patient p ON v.patient_id = p.patient_id
      WHERE v.doctor_id = $1 
      AND DATE(v.date_of_visit) > CURRENT_DATE
      AND v.visit_status = 'pending'
      ORDER BY v.date_of_visit ASC
      `,
      [doctorId]
    );

    return res.status(200).json({
      success: true,
      message: "Upcoming appointments retrieved successfully",
      data: upcomingVisitsQuery.rows,
    });
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

visitRoutes.get("/doctor/:doctorId/past", async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Verify doctor exists
    const isDoctorQuery = await pool.query(
      `SELECT * FROM doctor WHERE doctor_id = $1`,
      [doctorId]
    );

    if (isDoctorQuery.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Get past appointments (visited, missed, cancelled)
    const pastVisitsQuery = await pool.query(
      `
      SELECT v.*, p.patient_name 
      FROM visit v
      JOIN patient p ON v.patient_id = p.patient_id
      WHERE v.doctor_id = $1 
      AND (v.visit_status = 'visited' OR v.visit_status = 'missed' OR v.visit_status = 'cancelled')
      ORDER BY v.date_of_visit DESC
      LIMIT 20
      `,
      [doctorId]
    );

    return res.status(200).json({
      success: true,
      message: "Past appointments retrieved successfully",
      data: pastVisitsQuery.rows,
    });
  } catch (error) {
    console.error("Error fetching past appointments:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

visitRoutes.get("/doctor/:doctorId/statistics", async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Verify doctor exists
    const isDoctorQuery = await pool.query(
      `SELECT * FROM doctor WHERE doctor_id = $1`,
      [doctorId]
    );

    if (isDoctorQuery.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Get count of visits by status
    const countByStatusQuery = await pool.query(
      `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN visit_status = 'visited' THEN 1 END) as completed,
        COUNT(CASE WHEN visit_status = 'missed' THEN 1 END) as missed,
        COUNT(CASE WHEN visit_status = 'cancelled' THEN 1 END) as cancelled,
        COUNT(CASE WHEN visit_status = 'pending' THEN 1 END) as pending
      FROM visit
      WHERE doctor_id = $1
      `,
      [doctorId]
    );

    // Get appointments by day of week
    const appointmentsByDayQuery = await pool.query(
      `
      SELECT 
        to_char(date_of_visit, 'Day') as day_of_week,
        COUNT(*) as count
      FROM visit
      WHERE doctor_id = $1
      GROUP BY day_of_week
      ORDER BY 
        CASE 
          WHEN to_char(date_of_visit, 'Day') = 'Monday   ' THEN 1
          WHEN to_char(date_of_visit, 'Day') = 'Tuesday  ' THEN 2
          WHEN to_char(date_of_visit, 'Day') = 'Wednesday' THEN 3
          WHEN to_char(date_of_visit, 'Day') = 'Thursday ' THEN 4
          WHEN to_char(date_of_visit, 'Day') = 'Friday   ' THEN 5
          WHEN to_char(date_of_visit, 'Day') = 'Saturday ' THEN 6
          WHEN to_char(date_of_visit, 'Day') = 'Sunday   ' THEN 7
        END
      `,
      [doctorId]
    );

    // Format the appointments by day data
    const appointmentsByDay = {};
    appointmentsByDayQuery.rows.forEach(row => {
      appointmentsByDay[row.day_of_week.trim()] = parseInt(row.count);
    });

    // Prepare the statistics data
    const statistics = {
      totalAppointments: parseInt(countByStatusQuery.rows[0].total) || 0,
      completedAppointments: parseInt(countByStatusQuery.rows[0].completed) || 0,
      missedAppointments: parseInt(countByStatusQuery.rows[0].missed) || 0,
      cancelledAppointments: parseInt(countByStatusQuery.rows[0].cancelled) || 0,
      pendingAppointments: parseInt(countByStatusQuery.rows[0].pending) || 0,
      appointmentsByDay
    };

    return res.status(200).json({
      success: true,
      message: "Statistics retrieved successfully",
      data: statistics
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

visitRoutes.get("/patient/pending", async (req, res) => {
  try {
    const { patientId } = req.query; // Assuming patientId is passed as a query parameter e.g., /patient/pending?patientId=123

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "patientId is required.",
      });
    }

    const patientQuery = await pool.query(
      `SELECT * FROM patient WHERE patient_id = $1`,
      [patientId]
    );

    if (patientQuery.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const pendingVisitsQuery = await pool.query(
      `
      SELECT 
        v.doctor_id,
        v.date_of_visit,
        v.visit_status,
        v.visit_reason,
        v.report_id,
        d.doctor_name,
        d.doctor_specialization
      FROM visit v
      JOIN doctor d ON v.doctor_id = d.doctor_id
      WHERE v.patient_id = $1 AND v.visit_status = 'pending'
      ORDER BY v.date_of_visit ASC
      `,
      [patientId]
    );

    if (pendingVisitsQuery.rowCount === 0) {
      return res.status(200).json({
        success: true,
        message: "No pending appointments found for this patient.",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pending appointments retrieved successfully.",
      data: pendingVisitsQuery.rows,
    });
  } catch (error) {
    console.error("Error fetching patient's pending appointments:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

visitRoutes.post("/", async (req, res) => {
  try {
    const { patientId, doctorId, dateOfVisit, visitReason } = req.body;
    if (!patientId || !doctorId || !dateOfVisit || !visitReason) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    let parsedDate;
    try {
      parsedDate = new Date(dateOfVisit);

      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date format");
      }

      parsedDate = parsedDate.toISOString();
      console.log("Formatted date for DB:", parsedDate);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid date format. Please provide date in YYYY-MM-DD HH:MM format or ISO format.",
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
      INSERT INTO visit (patient_id, doctor_id, date_of_visit, visit_status, visit_reason)
      VALUES ($1, $2, $3, 'pending', $4)
      RETURNING *
      `,
      [patientId, doctorId, parsedDate, visitReason]
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

visitRoutes.put("/:visitId/status", async (req, res) => {
  try {
    const { visitId } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'visited', 'missed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status provided. Must be pending, visited, missed, or cancelled."
      });
    }
    
    // Parse the visit ID into its components
    const visitComponents = visitId.split('-');
    if (visitComponents.length !== 3) {
      return res.status(400).json({
        success: false,
        message: "Invalid visit ID format"
      });
    }
    
    const [patientId, doctorId, dateString] = visitComponents;
    
    // Update the visit status
    const updateQuery = await pool.query(
      `
      UPDATE visit 
      SET visit_status = $1
      WHERE patient_id = $2 AND doctor_id = $3 AND date_of_visit = $4
      RETURNING *
      `,
      [status, patientId, doctorId, dateString]
    );
    
    if (updateQuery.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Visit not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: `Visit status updated to ${status} successfully`,
      data: updateQuery.rows[0]
    });
  } catch (error) {
    console.error("Error updating visit status:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
});

export default visitRoutes;
