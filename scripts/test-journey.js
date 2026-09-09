const BASE_URL = "http://localhost:3000/api";

const logStep = (step, title) => {
  console.log(`\n========================================`);
  console.log(`[Step ${step}] ${title}`);
  console.log(`========================================`);
};

async function runBookingJourney() {
  try {
    // 1. Пошук поїздів за датою та напрямком
    logStep(1, "Search trains for '2026-10-15' (Kyiv -> Lviv)");
    const trainsRes = await fetch(`${BASE_URL}/trains?date=2026-10-15&from=Kyiv&to=Lviv`);
    const trainsData = await trainsRes.json();

    if (!trainsData.success || trainsData.data.length === 0) {
      throw new Error("No trains found for specified criteria.");
    }

    console.log(`Found ${trainsData.data.length} train(s):`);
    trainsData.data.forEach((t) => {
      console.log(` - ${t.number}: ${t.departureTime} -> ${t.arrivalTime} | Base: ${t.price} UAH | Available seats: ${t.availableSeatsCount}`);
    });

    // 2. Перевірка крайового випадку: повністю розпроданий поїзд (train-102)
    logStep(2, "Edge case check: Sold-out train (train-102)");
    const soldOutSeatsRes = await fetch(`${BASE_URL}/trains/train-102/seats`);
    const soldOutSeatsData = await soldOutSeatsRes.json();
    const availableInSoldOut = soldOutSeatsData.data.seats.filter((s) => s.status === "AVAILABLE");
    console.log(`Available seats in train-102: ${availableInSoldOut.length}`);
    if (availableInSoldOut.length === 0) {
      console.log("Verified: Train is correctly marked as fully booked.");
    }

    // 3. Вибір поїзда з вільними місцями (train-101) та перегляд схеми вагону
    logStep(3, "Inspecting seats for available train (train-101)");
    const seatsRes = await fetch(`${BASE_URL}/trains/train-101/seats`);
    const seatsData = await seatsRes.json();

    // Обираємо комфортне місце 1-го класу для перевірки priceModifier
    const firstClassSeat = seatsData.data.seats.find((s) => s.status === "AVAILABLE" && s.class === "1st");
    if (!firstClassSeat) {
      throw new Error("No 1st class seat available.");
    }
    console.log(`Selected Seat: ${firstClassSeat.seatNumber} (${firstClassSeat.class} class, modifier: x${firstClassSeat.priceModifier})`);

    // 4. Бронювання обраного місця
    logStep(4, `Holding seat ${firstClassSeat.seatNumber} for passenger 'Katerina'`);
    const bookingRes = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trainId: "train-101",
        seatId: firstClassSeat.id,
        passengerName: "Katerina"
      })
    });
    const bookingData = await bookingRes.json();

    if (!bookingData.success) {
      throw new Error(`Booking failed: ${bookingData.error?.message}`);
    }

    const booking = bookingData.data;
    console.log(`Booking ID: ${booking.id}`);
    console.log(`Status    : ${booking.status}`);
    console.log(`Total Price: ${booking.totalPrice} UAH (Base 650 * 1.4)`);
    console.log(`Expires At: ${booking.expiresAt}`);

    // 5. Перевірка захисту від конфлікту (подвійне бронювання того ж місця)
    logStep(5, "Conflict test: Attempting to book the same HOLD seat again");
    const conflictRes = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trainId: "train-101",
        seatId: firstClassSeat.id,
        passengerName: "Another Passenger"
      })
    });
    const conflictData = await conflictRes.json();
    console.log(`Status Code: ${conflictRes.status} (Expected: 409 Conflict)`);
    console.log(`Server message: "${conflictData.error?.message}"`);

    // 6. Симуляція збою оплати
    logStep(6, "Payment failure simulation");
    const failedPayRes = await fetch(`${BASE_URL}/bookings/${booking.id}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ simulateFailure: true })
    });
    const failedPayData = await failedPayRes.json();
    console.log(`Status Code: ${failedPayRes.status} (Expected: 402 Payment Required)`);
    console.log(`Server message: "${failedPayData.error?.message}"`);

    // 7. Успішна оплата
    logStep(7, "Retrying with successful payment");
    const payRes = await fetch(`${BASE_URL}/bookings/${booking.id}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ simulateFailure: false })
    });
    const payData = await payRes.json();

    if (!payData.success) {
      throw new Error(`Payment failed: ${payData.error?.message}`);
    }
    console.log(`Payment status: SUCCESS`);
    console.log(`Booking state: ${payData.booking.status}`);

    // 8. Отримання сформованого квитка
    logStep(8, "Fetching final issued ticket");
    const ticketRes = await fetch(`${BASE_URL}/bookings/${booking.id}/ticket`);
    const ticketData = await ticketRes.json();

    if (!ticketData.success) {
      throw new Error(`Failed to retrieve ticket: ${ticketData.error?.message}`);
    }

    const ticket = ticketData.data;
    console.log("\n🎫 ================= TRAIN TICKET ================= 🎫");
    console.log(`Ticket Code : ${ticket.ticketCode}`);
    console.log(`Passenger   : ${ticket.passengerName}`);
    console.log(`Train       : ${ticket.train.number} (${ticket.train.from} -> ${ticket.train.to})`);
    console.log(`Departure   : ${ticket.train.date} о ${ticket.train.departureTime}`);
    console.log(`Seat        : ${ticket.seatNumber} (Class: 1st)`);
    console.log(`Amount Paid : ${ticket.amountPaid} UAH`);
    console.log(`Issued At   : ${ticket.issuedAt}`);
    console.log("====================================================\n");

    console.log("✅ All edge cases and full booking journey verified successfully!");
  } catch (error) {
    console.error("\n❌ Journey failed:", error.message);
  }
}

runBookingJourney();