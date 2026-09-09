import { v4 as uuidv4 } from "uuid";
import { store } from "../data/memoryStore.js";

// Час утримання місця до оплати — 15 хвилин
const HOLD_TIMEOUT_MS = 15 * 60 * 1000;

export class BookingService {
  // 1. Пошук поїздів за датою та напрямком
  static searchTrains({ date, from, to }) {
    if (!date) {
      const error = new Error("Query parameter 'date' (YYYY-MM-DD) is required.");
      error.status = 400;
      throw error;
    }

    // Звільняємо прострочені місця перед підрахунком
    this._releaseExpiredBookings();

    const trains = store.findTrains({ date, from, to });

    return trains.map((train) => {
      const seats = store.getSeatsByTrainId(train.id);
      const availableSeatsCount = seats.filter((s) => s.status === "AVAILABLE").length;
      return {
        ...train,
        availableSeatsCount
      };
    });
  }

  // 2. Отримання списку місць конкретного поїзда
  static getTrainSeats(trainId) {
    const train = store.getTrainById(trainId);
    if (!train) {
      const error = new Error(`Train with ID '${trainId}' not found.`);
      error.status = 404;
      throw error;
    }

    this._releaseExpiredBookings();

    return {
      train: {
        id: train.id,
        number: train.number,
        date: train.date,
        from: train.from,
        to: train.to,
        price: train.price
      },
      seats: store.getSeatsByTrainId(trainId)
    };
  }

  // 3. Бронювання місця (переводить у статус PENDING_PAYMENT, а місце в HOLD)
  static createBooking({ trainId, seatId, passengerName }) {
    if (!trainId || !seatId || !passengerName?.trim()) {
      const error = new Error("Fields 'trainId', 'seatId', and 'passengerName' are required.");
      error.status = 400;
      throw error;
    }

    this._releaseExpiredBookings();

    const train = store.getTrainById(trainId);
    if (!train) {
      const error = new Error(`Train with ID '${trainId}' not found.`);
      error.status = 404;
      throw error;
    }

    const seat = store.getSeatById(seatId);
    if (!seat || seat.trainId !== trainId) {
      const error = new Error(`Seat with ID '${seatId}' does not belong to train '${trainId}'.`);
      error.status = 404;
      throw error;
    }

    if (seat.status !== "AVAILABLE") {
      const error = new Error(`Seat '${seat.seatNumber}' is not available (current status: ${seat.status}).`);
      error.status = 409; // Conflict
      throw error;
    }

    // Округлення до цілого числа
    const totalPrice = Math.round(train.price * (seat.priceModifier || 1.0));

    // Блокуємо місце
    store.updateSeatStatus(seatId, "HOLD");

    const now = new Date();
    const expiresAt = new Date(now.getTime() + HOLD_TIMEOUT_MS);

    const booking = {
      id: uuidv4(),
      trainId,
      seatId,
      passengerName: passengerName.trim(),
      totalPrice,
      status: "PENDING_PAYMENT",
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    return store.createBooking(booking);
  }

  // 4. Оплата бронювання (імітація платіжного шлюзу)
  static payBooking(bookingId, paymentPayload = {}) {
    this._releaseExpiredBookings();

    const booking = store.getBookingById(bookingId);
    if (!booking) {
      const error = new Error(`Booking with ID '${bookingId}' not found.`);
      error.status = 404;
      throw error;
    }

    if (booking.status === "PAID") {
      const error = new Error(`Booking '${bookingId}' is already paid.`);
      error.status = 400;
      throw error;
    }

    if (booking.status === "EXPIRED") {
      const error = new Error(`Hold time expired for booking '${bookingId}'. Please book a seat again.`);
      error.status = 410; // Gone
      throw error;
    }

    if (booking.status === "CANCELLED") {
      const error = new Error(`Cannot pay for booking '${bookingId}' because it was cancelled.`);
      error.status = 400;
      throw error;
    }

    // Симуляція можливої невдачі оплати за запитом
    if (paymentPayload.simulateFailure) {
      const error = new Error("Payment declined by the payment gateway.");
      error.status = 402; // Payment Required
      throw error;
    }

    // Оновлюємо статус бронювання та місця
    store.updateBooking(bookingId, {
      status: "PAID",
      paidAt: new Date().toISOString()
    });
    store.updateSeatStatus(booking.seatId, "BOOKED");

    // Генеруємо квиток
    const train = store.getTrainById(booking.trainId);
    const seat = store.getSeatById(booking.seatId);

    const ticket = {
      id: uuidv4(),
      bookingId: booking.id,
      ticketCode: `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      passengerName: booking.passengerName,
      train: {
        number: train.number,
        from: train.from,
        to: train.to,
        date: train.date,
        departureTime: train.departureTime,
        arrivalTime: train.arrivalTime
      },
      seatNumber: seat.seatNumber,
      amountPaid: booking.totalPrice,
      issuedAt: new Date().toISOString()
    };

    store.createTicket(ticket);

    return {
      message: "Payment successful. Ticket issued.",
      booking: store.getBookingById(bookingId),
      ticket
    };
  }

  // 5. Отримання оформленого квитка
  static getTicketByBookingId(bookingId) {
    const booking = store.getBookingById(bookingId);
    if (!booking) {
      const error = new Error(`Booking with ID '${bookingId}' not found.`);
      error.status = 404;
      throw error;
    }

    if (booking.status !== "PAID") {
      const error = new Error(`Booking '${bookingId}' is not paid yet.`);
      error.status = 400;
      throw error;
    }

    const ticket = store.getTicketByBookingId(bookingId);
    if (!ticket) {
      const error = new Error(`Ticket for booking '${bookingId}' was not found.`);
      error.status = 404;
      throw error;
    }

    return ticket;
  }

  // Внутрішній хелпер: звільнення прострочених броней
  static _releaseExpiredBookings() {
    const now = new Date();
    store.bookings.forEach((booking) => {
      if (booking.status === "PENDING_PAYMENT" && new Date(booking.expiresAt) < now) {
        booking.status = "EXPIRED";
        store.updateSeatStatus(booking.seatId, "AVAILABLE");
      }
    });
  }
}