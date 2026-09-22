// In-memory data layer, written as an async repository so every call site
// already awaits a "query". Swapping this file for a real Postgres/Mongo
// client later does not require touching controllers or routes.
import { nanoid } from "nanoid";
import { seedCars } from "./seed.cars.js";

const db = {
  users: [],
  cars: seedCars.map(c => ({ ...c })),
  bookings: [],
};

const delay = (ms = 0) => new Promise(r => setTimeout(r, ms));

export const UsersRepo = {
  async create(user) {
    await delay();
    const record = { id: "usr_" + nanoid(10), createdAt: new Date().toISOString(), role: "user", ...user };
    db.users.push(record);
    return record;
  },
  async findByEmail(email) {
    await delay();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  async findById(id) {
    await delay();
    return db.users.find(u => u.id === id) || null;
  },
  async update(id, patch) {
    await delay();
    const user = db.users.find(u => u.id === id);
    if (!user) return null;
    Object.assign(user, patch);
    return user;
  },
};

export const CarsRepo = {
  async list({ type, location, maxPrice } = {}) {
    await delay();
    let results = db.cars;
    if (type && type !== "All") results = results.filter(c => c.type === type);
    if (location) results = results.filter(c => c.location === location);
    if (maxPrice) results = results.filter(c => c.price <= Number(maxPrice));
    return results;
  },
  async findById(id) {
    await delay();
    return db.cars.find(c => c.id === id) || null;
  },
  async create(car) {
    await delay();
    const record = {
      id: "car_" + nanoid(8),
      status: "available",
      featured: false,
      rating: 0,
      reviews: 0,
      ownerId: null,
      ownerName: null,
      source: "fleet",
      imageUrl: null,
      ...car,
    };
    db.cars.push(record);
    return record;
  },
  async update(id, patch) {
    await delay();
    const car = db.cars.find(c => c.id === id);
    if (!car) return null;
    Object.assign(car, patch);
    return car;
  },
  async remove(id) {
    await delay();
    const idx = db.cars.findIndex(c => c.id === id);
    if (idx === -1) return false;
    db.cars.splice(idx, 1);
    return true;
  },
};

export const BookingsRepo = {
  async create(booking) {
    await delay();
    const record = {
      id: "bkg_" + nanoid(10),
      ref: "RV-" + nanoid(6).toUpperCase(),
      status: "confirmed",
      messages: [],
      createdAt: new Date().toISOString(),
      ...booking,
    };
    db.bookings.push(record);
    return record;
  },
  async listByUser(userId) {
    await delay();
    return db.bookings.filter(b => b.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async listAll() {
    await delay();
    return [...db.bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async findById(id) {
    await delay();
    return db.bookings.find(b => b.id === id) || null;
  },
  async update(id, patch) {
    await delay();
    const booking = db.bookings.find(b => b.id === id);
    if (!booking) return null;
    Object.assign(booking, patch);
    return booking;
  },
};

export async function seedAdmin(user) {
  const existing = await UsersRepo.findByEmail(user.email);
  if (existing) return existing;
  return UsersRepo.create({ ...user, role: "admin" });
}
