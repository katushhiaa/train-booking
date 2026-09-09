import express from "express";
import bookingRoutes from "./routes/bookingRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(express.json());

// API Маршрути
app.use("/api", bookingRoutes);

// Базовий статусний ендпоінт
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Глобальний обробник помилок
app.use(errorHandler);

export default app;