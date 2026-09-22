import { nanoid } from "nanoid";
import { BookingsRepo, CarsRepo } from "../data/store.js";
import { EXTRAS, priceExtras, daysBetween } from "../data/extras.js";
import { sanitizeText } from "../utils/sanitize.js";
import { encryptMessageText, withDecryptedBooking, withDecryptedBookings } from "../utils/messageCrypto.js";

function canAccessBooking(booking, car, user) {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (booking.userId === user.id) return true;
  if (car && car.ownerId === user.id) return true;
  return false;
}

function isValidDateRange(pickupDate, dropoffDate) {
  const pickup = new Date(pickupDate);
  const dropoff = new Date(dropoffDate);
  if (Number.isNaN(pickup.getTime()) || Number.isNaN(dropoff.getTime())) return "Pickup and return dates must be valid dates";

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  if (pickup < todayStart) return "Pickup date can't be in the past";
  if (dropoff <= pickup) return "Return date must be after the pickup date";
  return null;
}

export async function createBooking(req, res, next) {
  try {
    const { carId, pickupDate, dropoffDate, extras = [] } = req.body;
    if (!carId || !pickupDate || !dropoffDate) {
      return res.status(400).json({ error: "carId, pickupDate and dropoffDate are required" });
    }
    const dateError = isValidDateRange(pickupDate, dropoffDate);
    if (dateError) return res.status(400).json({ error: dateError });

    const car = await CarsRepo.findById(carId);
    if (!car) return res.status(404).json({ error: "Vehicle not found" });
    if (car.status !== "available") return res.status(409).json({ error: "Vehicle is not available" });
    if (car.ownerId === req.user.id) return res.status(400).json({ error: "You can't book your own listing" });

    const days = daysBetween(pickupDate, dropoffDate);
    const validExtras = Array.isArray(extras) ? extras.filter(id => EXTRAS.some(e => e.id === id)) : [];
    const carSubtotal = car.price * days;
    const extrasTotal = priceExtras(validExtras, days);
    const subtotal = carSubtotal + extrasTotal;
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + tax;

    // Owner-listed cars need host approval; core fleet cars confirm instantly.
    const status = car.ownerId ? "pending" : "confirmed";

    const booking = await BookingsRepo.create({
      userId: req.user.id,
      renterName: req.user.name,
      carId,
      carName: car.name,
      carOwnerId: car.ownerId,
      carOwnerName: car.ownerName,
      pickupDate,
      dropoffDate,
      days,
      extras: validExtras,
      carSubtotal,
      extrasTotal,
      tax,
      total,
      status,
    });

    res.status(201).json({ booking: withDecryptedBooking(booking) });
  } catch (err) {
    next(err);
  }
}

export async function listMyBookings(req, res, next) {
  try {
    const bookings = await BookingsRepo.listByUser(req.user.id);
    res.json({ bookings: withDecryptedBookings(bookings) });
  } catch (err) {
    next(err);
  }
}

export async function getBooking(req, res, next) {
  try {
    const booking = await BookingsRepo.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    const car = await CarsRepo.findById(booking.carId);
    if (!canAccessBooking(booking, car, req.user)) {
      return res.status(403).json({ error: "You don't have access to this booking" });
    }
    res.json({ booking: withDecryptedBooking(booking) });
  } catch (err) {
    next(err);
  }
}

export async function addMessage(req, res, next) {
  try {
    const cleanText = sanitizeText(req.body?.text, 1000);
    if (!cleanText) return res.status(400).json({ error: "Message text is required" });

    const booking = await BookingsRepo.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    const car = await CarsRepo.findById(booking.carId);
    if (!canAccessBooking(booking, car, req.user)) {
      return res.status(403).json({ error: "You don't have access to this booking" });
    }

    const message = {
      id: "msg_" + nanoid(8),
      senderId: req.user.id,
      senderName: req.user.name,
      text: encryptMessageText(cleanText), // stored encrypted at rest
      createdAt: new Date().toISOString(),
    };
    const updated = await BookingsRepo.update(booking.id, { messages: [...booking.messages, message] });
    res.status(201).json({ booking: withDecryptedBooking(updated) });
  } catch (err) {
    next(err);
  }
}

export async function cancelBooking(req, res, next) {
  try {
    const booking = await BookingsRepo.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.userId !== req.user.id) return res.status(403).json({ error: "Not your booking" });
    if (["cancelled", "declined"].includes(booking.status)) {
      return res.status(409).json({ error: "Already cancelled" });
    }

    const updated = await BookingsRepo.update(booking.id, { status: "cancelled" });
    res.json({ booking: withDecryptedBooking(updated) });
  } catch (err) {
    next(err);
  }
}
