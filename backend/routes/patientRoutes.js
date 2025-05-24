import { Router } from "express";
import pool from "../db.js";

const patientRoutes = Router();

patientRoutes.get("/", async (req, res) => {
  try {
    const allPatients = await pool.query("SELECT * FROM patient");
    res.json(allPatients.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

export default patientRoutes;
