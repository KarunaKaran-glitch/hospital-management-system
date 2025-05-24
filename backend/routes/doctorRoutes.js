import { Router } from "express";
import pool from "../db.js";

const doctorRoutes = Router();

doctorRoutes.get("/", async (req, res) => {
  try {
    const allDoctors = await pool.query("SELECT * FROM doctor");
    res.json(allDoctors.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

export default doctorRoutes;