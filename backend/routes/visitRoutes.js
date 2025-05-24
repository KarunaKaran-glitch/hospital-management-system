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

export default visitRoutes;