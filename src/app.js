import express from "express";
import bookingRoutes from "./routes/bookingRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(express.json());

app.use("/api", bookingRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;