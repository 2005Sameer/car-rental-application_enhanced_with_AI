import { CarsRepo, BookingsRepo } from "../data/store.js";
import { deleteCarImageFile } from "../middleware/upload.middleware.js";
import { sanitizeText } from "../utils/sanitize.js";
import { withDecryptedBooking, withDecryptedBookings } from "../utils/messageCrypto.js";

async function myCarIds(userId) {
  const cars = await CarsRepo.list({});
  return new Set(cars.filter(c => c.ownerId === userId).map(c => c.id));
}

export async function myListings(req, res, next) {
  try {
    const cars = await CarsRepo.list({});
    res.json({ cars: cars.filter(c => c.ownerId === req.user.id) });
  } catch (err) {
    next(err);
  }
}

export async function createListing(req, res, next) {
  try {
    const { type, seats, trans, power, rangeLabel, price, location } = req.body;
    const name = sanitizeText(req.body.name, 80);
    if (!name) return res.status(400).json({ error: "name is required" });

    const car = await CarsRepo.create({
      name, type, seats: Number(seats) || 4, trans: sanitizeText(trans, 30) || "Auto",
      power: sanitizeText(power, 30) || "—", rangeLabel: sanitizeText(rangeLabel, 30) || "—",
      price: Number(price), location, tone: "teal",
      ownerId: req.user.id, ownerName: req.user.name, source: "owner",
      rating: 5, reviews: 0,
    });
    res.status(201).json({ car });
  } catch (err) {
    next(err);
  }
}

export async function updateListing(req, res, next) {
  try {
    const car = await CarsRepo.findById(req.params.id);
    if (!car) return res.status(404).json({ error: "Listing not found" });
    if (car.ownerId !== req.user.id) return res.status(403).json({ error: "Not your listing" });

    const patch = { ...req.body };
    if (patch.name !== undefined) patch.name = sanitizeText(patch.name, 80);
    // ownerId/ownerName/source are identity fields — never settable via this endpoint.
    delete patch.ownerId;
    delete patch.ownerName;
    delete patch.source;

    const updated = await CarsRepo.update(req.params.id, patch);
    res.json({ car: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteListing(req, res, next) {
  try {
    const car = await CarsRepo.findById(req.params.id);
    if (!car) return res.status(404).json({ error: "Listing not found" });
    if (car.ownerId !== req.user.id) return res.status(403).json({ error: "Not your listing" });

    await CarsRepo.remove(req.params.id);
    deleteCarImageFile(car.imageUrl);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function uploadListingImage(req, res, next) {
  try {
    const car = await CarsRepo.findById(req.params.id);
    if (!car) return res.status(404).json({ error: "Listing not found" });
    if (car.ownerId !== req.user.id) return res.status(403).json({ error: "Not your listing" });
    if (!req.file) return res.status(400).json({ error: "No image file received" });

    deleteCarImageFile(car.imageUrl);
    const imageUrl = `/uploads/cars/${req.file.filename}`;
    const updated = await CarsRepo.update(car.id, { imageUrl });
    res.status(201).json({ car: updated });
  } catch (err) {
    next(err);
  }
}

export async function bookingRequests(req, res, next) {
  try {
    const ids = await myCarIds(req.user.id);
    const bookings = await BookingsRepo.listAll();
    res.json({ bookings: withDecryptedBookings(bookings.filter(b => ids.has(b.carId))) });
  } catch (err) {
    next(err);
  }
}

async function transitionOwnedBooking(req, res, next, nextStatus, allowedFrom) {
  try {
    const booking = await BookingsRepo.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const car = await CarsRepo.findById(booking.carId);
    if (!car || car.ownerId !== req.user.id) {
      return res.status(403).json({ error: "Not your listing's booking" });
    }
    if (!allowedFrom.includes(booking.status)) {
      return res.status(409).json({ error: `Booking is already ${booking.status}` });
    }

    const updated = await BookingsRepo.update(booking.id, { status: nextStatus });
    res.json({ booking: withDecryptedBooking(updated) });
  } catch (err) {
    next(err);
  }
}

export const approveBooking = (req, res, next) => transitionOwnedBooking(req, res, next, "confirmed", ["pending"]);
export const declineBooking = (req, res, next) => transitionOwnedBooking(req, res, next, "declined", ["pending"]);
