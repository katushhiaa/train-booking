export const initialTrains = [
  {
    id: "train-101",
    number: "IC 705",
    from: "Kyiv",
    to: "Lviv",
    date: "2026-10-15",
    departureTime: "06:30",
    arrivalTime: "12:45",
    price: 650.0
  },
  {
    id: "train-102",
    number: "IC 715",
    from: "Kyiv",
    to: "Lviv",
    date: "2026-10-15",
    departureTime: "14:20",
    arrivalTime: "20:35",
    price: 720.0
  },
  {
    id: "train-103",
    number: "N 091",
    from: "Kyiv",
    to: "Lviv",
    date: "2026-10-15",
    departureTime: "22:50",
    arrivalTime: "06:20",
    price: 550.0
  },
  {
    id: "train-201",
    number: "N 043",
    from: "Kyiv",
    to: "Ivano-Frankivsk",
    date: "2026-10-16",
    departureTime: "19:06",
    arrivalTime: "05:43",
    price: 480.0
  },
  {
    id: "train-301",
    number: "IC 749",
    from: "Kyiv",
    to: "Chernivtsi",
    date: "2026-10-17",
    departureTime: "13:10",
    arrivalTime: "22:15",
    price: 610.0
  }
];

export const initialSeats = [
  // Поїзд 101: змішані місця (1-й та 2-й клас)
  { id: "seat-101-1", trainId: "train-101", seatNumber: "1A", class: "1st", priceModifier: 1.4, status: "AVAILABLE" },
  { id: "seat-101-2", trainId: "train-101", seatNumber: "1B", class: "1st", priceModifier: 1.4, status: "AVAILABLE" },
  { id: "seat-101-3", trainId: "train-101", seatNumber: "2A", class: "2nd", priceModifier: 1.0, status: "AVAILABLE" },
  { id: "seat-101-4", trainId: "train-101", seatNumber: "2B", class: "2nd", priceModifier: 1.0, status: "AVAILABLE" },
  { id: "seat-101-5", trainId: "train-101", seatNumber: "3A", class: "2nd", priceModifier: 1.0, status: "AVAILABLE" },
  { id: "seat-101-6", trainId: "train-101", seatNumber: "3B", class: "2nd", priceModifier: 1.0, status: "AVAILABLE" },

  // Поїзд 102: повністю розпроданий (для тестування відсутності місць)
  { id: "seat-102-1", trainId: "train-102", seatNumber: "1A", class: "2nd", priceModifier: 1.0, status: "BOOKED" },
  { id: "seat-102-2", trainId: "train-102", seatNumber: "1B", class: "2nd", priceModifier: 1.0, status: "BOOKED" },
  { id: "seat-102-3", trainId: "train-102", seatNumber: "2A", class: "2nd", priceModifier: 1.0, status: "BOOKED" },

  // Поїзд 103: частково зайнятий
  { id: "seat-103-1", trainId: "train-103", seatNumber: "1A", class: "Coupe", priceModifier: 1.0, status: "AVAILABLE" },
  { id: "seat-103-2", trainId: "train-103", seatNumber: "1B", class: "Coupe", priceModifier: 1.0, status: "BOOKED" },
  { id: "seat-103-3", trainId: "train-103", seatNumber: "2A", class: "Coupe", priceModifier: 1.0, status: "AVAILABLE" },

  // Поїзд 201: звичайні вільні місця
  { id: "seat-201-1", trainId: "train-201", seatNumber: "1A", class: "Coupe", priceModifier: 1.0, status: "AVAILABLE" },
  { id: "seat-201-2", trainId: "train-201", seatNumber: "1B", class: "Coupe", priceModifier: 1.0, status: "AVAILABLE" },

  // Поїзд 301: кілька вільних місць
  { id: "seat-301-1", trainId: "train-301", seatNumber: "1A", class: "2nd", priceModifier: 1.0, status: "AVAILABLE" },
  { id: "seat-301-2", trainId: "train-301", seatNumber: "1B", class: "2nd", priceModifier: 1.0, status: "AVAILABLE" },
  { id: "seat-301-3", trainId: "train-301", seatNumber: "2A", class: "1st", priceModifier: 1.3, status: "AVAILABLE" }
];