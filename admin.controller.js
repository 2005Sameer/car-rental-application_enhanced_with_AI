import { CarsRepo, BookingsRepo } from "../data/store.js";
import { deleteCarImageFile } from "../middleware/upload.middleware.js";
import { sanitizeText } from "../utils/sanitize.js";
import { withDecryptedBookings } from "../utils/messageCrypto.js";

export async function listFleet(req, res, next) {
  try {
    const cars = await CarsRepo.list({});
    res.json({ cars });
  } catch (err) {
    next(err);
  }
}

export async function createCar(req, res, next) {
  try {
    const { type, seats, trans, power, rangeLabel, price, location } = req.body;
    const name = sanitizeText(req.body.name, 80);
    if (!name) return res.status(400).json({ error: "name is required" });

    const car = await CarsRepo.create({
      name, type, seats, trans: sanitizeText(trans, 30), power: sanitizeText(power, 30),
      rangeLabel: sanitizeText(rangeLabel, 30), price, location, tone: "slate",
    });
    res.status(201).json({ car });
  } catch (err) {
    next(err);
  }
}

export async function updateCar(req, res, next) {
  try {
    const patch = { ...req.body };
    if (patch.name !== undefined) patch.name = sanitizeText(patch.name, 80);
    // Identity/ownership fields are never settable through this endpoint.
    delete patch.ownerId;
    delete patch.ownerName;
    delete patch.source;

    const car = await CarsRepo.update(req.params.id, patch);
    if (!car) return res.status(404).json({ error: "Vehicle not found" });
    res.json({ car });
  } catch (err) {
    next(err);
  }
}

export async function deleteCar(req, res, next) {
  try {
    const car = await CarsRepo.findById(req.params.id);
    const ok = await CarsRepo.remove(req.params.id);
    if (!ok) return res.status(404).json({ error: "Vehicle not found" });
    deleteCarImageFile(car?.imageUrl);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function uploadCarImage(req, res, next) {
  try {
    const car = await CarsRepo.findById(req.params.id);
    if (!car) return res.status(404).json({ error: "Vehicle not found" });
    if (!req.file) return res.status(400).json({ error: "No image file received" });

    deleteCarImageFile(car.imageUrl);
    const imageUrl = `/uploads/cars/${req.file.filename}`;
    const updated = await CarsRepo.update(car.id, { imageUrl });
    res.status(201).json({ car: updated });
  } catch (err) {
    next(err);
  }
}

export async function listAllBookings(req, res, next) {
  try {
    const bookings = await BookingsRepo.listAll();
    res.json({ bookings: withDecryptedBookings(bookings) });
  } catch (err) {
    next(err);
  }
}

export async function analytics(req, res, next) {
  try {
    const [cars, bookings] = await Promise.all([CarsRepo.list({}), BookingsRepo.listAll()]);
    const active = bookings.filter(b => b.status !== "cancelled");
    const revenue = active.reduce((sum, b) => sum + b.total, 0);
    const byType = cars.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {});
    const bookingsByStatus = bookings.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});
    const fleetUtilization = cars.length
      ? Math.round((cars.filter(c => c.status === "available").length / cars.length) * 100)
      : 0;

    res.json({
      totals: {
        fleetSize: cars.length,
        totalBookings: bookings.length,
        activeBookings: active.length,
        revenue,
        fleetAvailablePct: fleetUtilization,
      },
      byType,
      bookingsByStatus,
    });
  } catch (err) {
    next(err);
  }
}
