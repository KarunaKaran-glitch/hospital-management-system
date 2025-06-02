import { Router } from "express";
import pool from "../db.js";

const adminRoutes = Router();

// Patient statistics
adminRoutes.get("/statistics/patients", async (req, res) => {
  try {
    // Total patients count
    const totalPatientsQuery = await pool.query("SELECT COUNT(*) FROM patient");

    // Patients by gender
    const patientsByGenderQuery = await pool.query(
      `SELECT 
        patient_gender, 
        COUNT(*) as count 
      FROM patient 
      GROUP BY patient_gender`
    );

    // Patients by blood group
    const patientsByBloodGroupQuery = await pool.query(
      `SELECT 
        patient_blood_group, 
        COUNT(*) as count 
      FROM patient 
      GROUP BY patient_blood_group
      ORDER BY count DESC`
    );

    // Patients by age group - Fixed to use a derived table
    const patientsByAgeGroupQuery = await pool.query(
      `SELECT 
        age_group,
        COUNT(*) as count
      FROM (
        SELECT
          CASE
            WHEN EXTRACT(YEAR FROM AGE(NOW(), patient_dob)) < 18 THEN 'Under 18'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), patient_dob)) BETWEEN 18 AND 30 THEN '18-30'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), patient_dob)) BETWEEN 31 AND 45 THEN '31-45'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), patient_dob)) BETWEEN 46 AND 60 THEN '46-60'
            ELSE 'Over 60'
          END as age_group
        FROM patient
      ) AS age_groups
      GROUP BY age_group
      ORDER BY 
        CASE age_group
          WHEN 'Under 18' THEN 1
          WHEN '18-30' THEN 2
          WHEN '31-45' THEN 3
          WHEN '46-60' THEN 4
          WHEN 'Over 60' THEN 5
        END`
    );

    // Recently added patients
    const recentlyAddedPatientsQuery = await pool.query(
      `SELECT patient_id, patient_name, patient_gender, patient_dob, patient_updated_at
       FROM patient
       ORDER BY patient_updated_at DESC
       LIMIT 5`
    );

    // Format data
    const patientsByGender = {};
    patientsByGenderQuery.rows.forEach((row) => {
      const genderLabel =
        row.patient_gender === "M"
          ? "Male"
          : row.patient_gender === "F"
          ? "Female"
          : "Other";
      patientsByGender[genderLabel] = parseInt(row.count);
    });

    const patientsByBloodGroup = {};
    patientsByBloodGroupQuery.rows.forEach((row) => {
      patientsByBloodGroup[row.patient_blood_group] = parseInt(row.count);
    });

    const patientsByAgeGroup = {};
    patientsByAgeGroupQuery.rows.forEach((row) => {
      patientsByAgeGroup[row.age_group] = parseInt(row.count);
    });

    return res.status(200).json({
      success: true,
      data: {
        totalPatients: parseInt(totalPatientsQuery.rows[0].count),
        patientsByGender,
        patientsByBloodGroup,
        patientsByAgeGroup,
        recentlyAddedPatients: recentlyAddedPatientsQuery.rows,
      },
    });
  } catch (error) {
    console.error("Error fetching patient statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// Doctor statistics
adminRoutes.get("/statistics/doctors", async (req, res) => {
  try {
    // Total doctors count
    const totalDoctorsQuery = await pool.query("SELECT COUNT(*) FROM doctor");

    // Available doctors count
    const availableDoctorsQuery = await pool.query(
      "SELECT COUNT(*) FROM doctor WHERE doctor_is_available = true"
    );

    // Doctors by specialization
    const doctorsBySpecializationQuery = await pool.query(
      `SELECT 
        doctor_specialization, 
        COUNT(*) as count 
      FROM doctor 
      GROUP BY doctor_specialization
      ORDER BY count DESC`
    );

    // Doctors by gender - Adjusted to match schema
    const doctorsByGenderQuery = await pool.query(
      `SELECT 
        doctor_gender, 
        COUNT(*) as count 
      FROM doctor 
      GROUP BY doctor_gender`
    );

    // Format data
    const doctorsBySpecialization = {};
    doctorsBySpecializationQuery.rows.forEach((row) => {
      doctorsBySpecialization[row.doctor_specialization] = parseInt(row.count);
    });

    const doctorsByGender = {};
    doctorsByGenderQuery.rows.forEach((row) => {
      // Adjust to match schema - doctor_gender is a char(1)
      const genderLabel =
        row.doctor_gender === "M"
          ? "Male"
          : row.doctor_gender === "F"
          ? "Female"
          : "Other";
      doctorsByGender[genderLabel] = parseInt(row.count);
    });

    return res.status(200).json({
      success: true,
      data: {
        totalDoctors: parseInt(totalDoctorsQuery.rows[0].count),
        availableDoctors: parseInt(availableDoctorsQuery.rows[0].count),
        doctorsBySpecialization,
        doctorsByGender,
      },
    });
  } catch (error) {
    console.error("Error fetching doctor statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// Visit statistics
adminRoutes.get("/statistics/visits", async (req, res) => {
  try {
    // Total visits count
    const totalVisitsQuery = await pool.query("SELECT COUNT(*) FROM visit");

    // Visits by status
    const visitsByStatusQuery = await pool.query(
      `SELECT 
        visit_status, 
        COUNT(*) as count 
      FROM visit 
      GROUP BY visit_status`
    );

    // Visits by doctor
    const visitsByDoctorQuery = await pool.query(
      `SELECT 
        d.doctor_id,
        d.doctor_name,
        COUNT(v.*) as visit_count
      FROM doctor d
      LEFT JOIN visit v ON d.doctor_id = v.doctor_id
      GROUP BY d.doctor_id, d.doctor_name
      ORDER BY visit_count DESC
      LIMIT 10`
    );

    // Visits by day of week
    const visitsByDayQuery = await pool.query(
      `SELECT 
        to_char(date_of_visit, 'Day') as day_of_week,
        COUNT(*) as count
      FROM visit
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
        END`
    );

    // Visits by month
    const visitsByMonthQuery = await pool.query(
      `SELECT 
        to_char(date_of_visit, 'Month') as month,
        COUNT(*) as count
      FROM visit
      GROUP BY month
      ORDER BY 
        CASE 
          WHEN to_char(date_of_visit, 'Month') = 'January  ' THEN 1
          WHEN to_char(date_of_visit, 'Month') = 'February ' THEN 2
          WHEN to_char(date_of_visit, 'Month') = 'March    ' THEN 3
          WHEN to_char(date_of_visit, 'Month') = 'April    ' THEN 4
          WHEN to_char(date_of_visit, 'Month') = 'May      ' THEN 5
          WHEN to_char(date_of_visit, 'Month') = 'June     ' THEN 6
          WHEN to_char(date_of_visit, 'Month') = 'July     ' THEN 7
          WHEN to_char(date_of_visit, 'Month') = 'August   ' THEN 8
          WHEN to_char(date_of_visit, 'Month') = 'September' THEN 9
          WHEN to_char(date_of_visit, 'Month') = 'October  ' THEN 10
          WHEN to_char(date_of_visit, 'Month') = 'November ' THEN 11
          WHEN to_char(date_of_visit, 'Month') = 'December ' THEN 12
        END`
    );

    // Recent visits with patient and doctor names
    const recentVisitsQuery = await pool.query(
      `SELECT 
        v.patient_id, 
        v.doctor_id, 
        v.date_of_visit, 
        v.visit_status, 
        v.visit_reason,
        p.patient_name,
        d.doctor_name
      FROM visit v
      JOIN patient p ON v.patient_id = p.patient_id
      JOIN doctor d ON v.doctor_id = d.doctor_id
      ORDER BY v.date_of_visit DESC
      LIMIT 10`
    );

    // Format data
    const visitsByStatus = {};
    visitsByStatusQuery.rows.forEach((row) => {
      visitsByStatus[row.visit_status] = parseInt(row.count);
    });

    const visitsByDoctor = {};
    visitsByDoctorQuery.rows.forEach((row) => {
      visitsByDoctor[row.doctor_name] = parseInt(row.visit_count);
    });

    const visitsByDay = {};
    visitsByDayQuery.rows.forEach((row) => {
      visitsByDay[row.day_of_week.trim()] = parseInt(row.count);
    });

    const visitsByMonth = {};
    visitsByMonthQuery.rows.forEach((row) => {
      visitsByMonth[row.month.trim()] = parseInt(row.count);
    });

    return res.status(200).json({
      success: true,
      data: {
        totalVisits: parseInt(totalVisitsQuery.rows[0].count),
        visitsByStatus,
        visitsByDoctor,
        visitsByDay,
        visitsByMonth,
        recentVisits: recentVisitsQuery.rows,
      },
    });
  } catch (error) {
    console.error("Error fetching visit statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

// New route: Financial statistics
adminRoutes.get("/statistics/revenue", async (req, res) => {
  try {
    // For a future implementation, might include billing/payment data
    // Returning placeholder data for now
    return res.status(200).json({
      success: true,
      data: {
        message: "Financial statistics will be implemented in the future when billing data is available"
      }
    });
  } catch (error) {
    console.error("Error fetching revenue statistics:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

export default adminRoutes;
