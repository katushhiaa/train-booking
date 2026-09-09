import { initialTrains, initialSeats } from "./mockData.js";

class MemoryStore {
  constructor() {
    this.trains = [...initialTrains];
    this.seats = [...initialSeats];
    this.bookings = [];
    this.tickets = [];
  }

  findTrains({ date, from, to }) {
    return this.trains.filter((train) => {
      const matchDate = !date || train.date === date;
      const matchFrom = !from || train.from.toLowerCase() === from.toLowerCase();
      const matchTo = !to || train.to.toLowerCase() === to.toLowerCase();
      return matchDate && matchFrom && matchTo;
    });
  }

  getTrainById(id) {
    return this.trains.find((t) => t.id === id);
  }

  getSeatsByTrainId(trainId) {
    return this.seats.filter((seat) => seat.trainId === trainId);
  }

  getSeatById(id) {
    return this.seats.find((s) => s.id === id);
  }

  updateSeatStatus(seatId, status) {
    const seat = this.getSeatById(seatId);
    if (seat) {
      seat.status = status;
    }
    return seat;
  }

  createBooking(booking) {
    this.bookings.push(booking);
    return booking;
  }

  getBookingById(id) {
    return this.bookings.find((b) => b.id === id);
  }

  updateBooking(id, updates) {
    const booking = this.getBookingById(id);
    if (booking) {
      Object.assign(booking, updates);
    }
    return booking;
  }

  createTicket(ticket) {
    this.tickets.push(ticket);
    return ticket;
  }

  getTicketById(id) {
    return this.tickets.find((t) => t.id === id);
  }

  getTicketByBookingId(bookingId) {
    return this.tickets.find((t) => t.bookingId === bookingId);
  }
}

export const store = new MemoryStore();