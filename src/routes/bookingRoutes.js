import { Router } from "express";
import { BookingController } from "../controllers/bookingController.js";

const router = Router();

router.get("/trains", BookingController.getTrains);
router.get("/trains/:id/seats", BookingController.getTrainSeats);
router.post("/bookings", BookingController.createBooking);
router.post("/bookings/:id/pay", BookingController.payBooking);
router.get("/bookings/:bookingId/ticket", BookingController.getTicket);

export default router;