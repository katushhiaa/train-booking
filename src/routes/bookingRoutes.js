import { Router } from "express";
import { BookingController } from "../controllers/bookingController.js";

const router = Router();

// 1. Пошук поїздів за датою (обов'язковий параметр: date)
router.get("/trains", BookingController.getTrains);

// 2. Отримання вільних/зайнятих місць у вибраному поїзді
router.get("/trains/:id/seats", BookingController.getTrainSeats);

// 3. Бронювання обраного місця
router.post("/bookings", BookingController.createBooking);

// 4. Оплата бронювання
router.post("/bookings/:id/pay", BookingController.payBooking);

// 5. Отримання сформованого квитка
router.get("/bookings/:bookingId/ticket", BookingController.getTicket);

export default router;