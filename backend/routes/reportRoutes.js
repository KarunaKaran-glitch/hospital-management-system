import { Router } from "express";   
import pool from "../db.js";

const reportRoutes = Router();

reportRoutes.get("/", async (req, res) => {
  try {
    const allReports = await pool.query("SELECT * FROM report");
    res.json(allReports.rows);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

export default reportRoutes;