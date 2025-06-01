import { Router } from "express";
import pool from "../db.js";

const reportRoutes = Router();

reportRoutes.get("/", async (req, res) => {
  const { patientId } = req.query;

  if (patientId) {
    try {
      const patientReports = await pool.query(
        "SELECT * FROM report WHERE patient_id = $1",
        [patientId]
      );
      if (patientReports.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No reports found for this patient",
        });
      }
      return res.status(200).json({
        success: true,
        data: patientReports.rows,
      });
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server error");
    }
  }
  try {
    const allReports = await pool.query("SELECT * FROM report");
    res.json(allReports.rows);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

export default reportRoutes;
