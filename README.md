# Train Ticket Booking Backend

A lightweight backend prototype for a train ticket booking service built with Node.js and Express. The service allows a user to complete an end-to-end booking flow: search trains by date, view seat availability, place a seat on hold, simulate payment, and retrieve the issued travel ticket.

All state is maintained in-memory without external databases or third-party integrations.

---

## Instructions for Running the Project

### Prerequisites
* Node.js v18.0.0 or higher
* npm

### Installation
Clone or open the repository, then install project dependencies:
```bash
npm install
```

### Running the Server
```bash
# Start server
npm start

# Alternatively, start in watch mode (auto-reload on file change)
npm run dev
```
The server will run on `http://localhost:3000`.  
A basic health check endpoint is available at `http://localhost:3000/health`.

### Running Tests & Automated Journey
Ensure the server is running (`npm start`), then execute the automated end-to-end journey in a separate terminal:
```bash
npm run test:journey
```

---

## Short Example of the Main Booking Journey

The complete flow can be tested sequentially using the following HTTP requests:

### 1. Choose a travel date and search trains
```bash
curl -X GET "http://localhost:3000/api/trains?date=2026-10-15&from=Kyiv&to=Lviv"
```
**Example Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "train-101",
      "number": "IC 705",
      "from": "Kyiv",
      "to": "Lviv",
      "date": "2026-10-15",
      "departureTime": "06:30",
      "arrivalTime": "12:45",
      "price": 650,
      "availableSeatsCount": 6
    }
  ]
}
```

### 2. Choose an available seat
```bash
curl -X GET "http://localhost:3000/api/trains/train-101/seats"
```
**Example Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "train": {
      "id": "train-101",
      "number": "IC 705",
      "date": "2026-10-15",
      "from": "Kyiv",
      "to": "Lviv",
      "price": 650
    },
    "seats": [
      {
        "id": "seat-101-1",
        "seatNumber": "1A",
        "class": "1st",
        "priceModifier": 1.4,
        "status": "AVAILABLE"
      }
    ]
  }
}
```

### 3. Book the seat (Hold)
```bash
curl -X POST "http://localhost:3000/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "trainId": "train-101",
    "seatId": "seat-101-1",
    "passengerName": "Katerina"
  }'
```
**Example Response (201 Created):**
```json
{
  "success": true,
  "message": "Seat held successfully. Complete payment before expiration.",
  "data": {
    "id": "766c491d-bf26-4f9d-87cf-a2c6f28a4220",
    "trainId": "train-101",
    "seatId": "seat-101-1",
    "passengerName": "Katerina",
    "totalPrice": 910,
    "status": "PENDING_PAYMENT",
    "createdAt": "2026-10-15T08:00:00.000Z",
    "expiresAt": "2026-10-15T08:15:00.000Z"
  }
}
```

### 4. Pay for the booking
```bash
curl -X POST "http://localhost:3000/api/bookings/766c491d-bf26-4f9d-87cf-a2c6f28a4220/pay" \
  -H "Content-Type: application/json" \
  -d '{"simulateFailure": false}'
```
**Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment successful. Ticket issued.",
  "booking": {
    "id": "766c491d-bf26-4f9d-87cf-a2c6f28a4220",
    "status": "PAID",
    "paidAt": "2026-10-15T08:05:00.000Z"
  },
  "ticket": {
    "id": "27d6d849-a681-424f-a9b0-9e8cbb62e927",
    "ticketCode": "TKT-MYG619",
    "passengerName": "Katerina",
    "seatNumber": "1A",
    "amountPaid": 910
  }
}
```

### 5. Receive the ticket
```bash
curl -X GET "http://localhost:3000/api/bookings/766c491d-bf26-4f9d-87cf-a2c6f28a4220/ticket"
```
**Example Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "27d6d849-a681-424f-a9b0-9e8cbb62e927",
    "bookingId": "766c491d-bf26-4f9d-87cf-a2c6f28a4220",
    "ticketCode": "TKT-MYG619",
    "passengerName": "Katerina",
    "train": {
      "number": "IC 705",
      "from": "Kyiv",
      "to": "Lviv",
      "date": "2026-10-15",
      "departureTime": "06:30",
      "arrivalTime": "12:45"
    },
    "seatNumber": "1A",
    "amountPaid": 910,
    "issuedAt": "2026-10-15T08:05:00.000Z"
  }
}
```

---

## Main Assumptions and Decisions

1. **Two-Phase Reservation (Hold & Confirm):**
   * Selecting and booking a seat moves it into a temporary `HOLD` state and creates a booking with status `PENDING_PAYMENT`.
   * A reservation lock lasts **15 minutes**. If unpaid when the deadline passes, subsequent requests expire the booking and restore the seat status to `AVAILABLE`.
2. **Conflict Prevention:**
   * An attempt to reserve a seat that is already in `HOLD` or `BOOKED` state immediately responds with `409 Conflict`.
3. **Payment Processing:**
   * A real payment gateway is simulated via `POST /api/bookings/:id/pay`. Passing `{"simulateFailure": true}` triggers a payment decline (`402 Payment Required`).
   * Successful payments transition the booking to `PAID`, lock the seat as `BOOKED`, and create an immutable ticket with an alphanumeric code.
4. **Pricing and Precision:**
   * Different seat categories (e.g., 1st class, Coupe) apply a `priceModifier`.
   * Final prices are rounded to integers (`Math.round`) to avoid floating-point representation anomalies.
5. **Scope & Persistence:**
   * The prototype strictly avoids external databases, user accounts, and authentication layers.
   * State is stored entirely in memory and resets when the Node.js process terminates.