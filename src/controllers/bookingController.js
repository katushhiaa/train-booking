import { BookingService } from "../services/bookingService.js";

export class BookingController {
  static getTrains(req, res, next) {
    try {
      const { date, from, to } = req.query;
      const trains = BookingService.searchTrains({ date, from, to });
      res.json({
        success: true,
        count: trains.length,
        data: trains
      });
    } catch (error) {
      next(error);
    }
  }

  static getTrainSeats(req, res, next) {
    try {
      const { id } = req.params;
      const result = BookingService.getTrainSeats(id);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static createBooking(req, res, next) {
    try {
      const { trainId, seatId, passengerName } = req.body;
      const booking = BookingService.createBooking({ trainId, seatId, passengerName });
      res.status(201).json({
        success: true,
        message: "Seat held successfully. Complete payment before expiration.",
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }

  static payBooking(req, res, next) {
    try {
      const { id } = req.params;
      const result = BookingService.payBooking(id, req.body);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  static getTicket(req, res, next) {
    try {
      const { bookingId } = req.params;
      const ticket = BookingService.getTicketByBookingId(bookingId);
      res.json({
        success: true,
        data: ticket
      });
    } catch (error) {
      next(error);
    }
  }
}