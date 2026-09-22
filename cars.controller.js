import { CarsRepo } from "../data/store.js";

export async function listCars(req, res, next) {
  try {
    const { type, location, maxPrice } = req.query;
    const cars = await CarsRepo.list({ type, location, maxPrice });
    res.json({ cars: cars.filter(c => c.status === "available" || !req.query.availableOnly) });
  } catch (err) {
    next(err);
  }
}

export async function getCar(req, res, next) {
  try {
    const car = await CarsRepo.findById(req.params.id);
    if (!car) return res.status(404).json({ error: "Vehicle not found" });
    res.json({ car });
  } catch (err) {
    next(err);
  }
}
