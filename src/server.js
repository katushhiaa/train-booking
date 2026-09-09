import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Train Booking API server is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});