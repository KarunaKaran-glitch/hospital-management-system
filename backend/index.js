import express from "express";
import dotenv from "dotenv";

import patientRoutes from "./routes/patientRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import visitRoutes from "./routes/visitRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

const port = process.env.PORT;
const app = express();

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use("/patients", patientRoutes);
app.use("/doctors", doctorRoutes);
app.use("/visits", visitRoutes);
app.use("/reports", reportRoutes);

app.listen(port, () => {
  console.log(`Server started at ${port}`);
});

export default app;
