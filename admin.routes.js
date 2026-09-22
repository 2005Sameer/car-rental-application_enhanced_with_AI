import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { carImageUpload } from "../middleware/upload.middleware.js";
import { validateBody, rules } from "../middleware/validate.js";
import {
  listFleet, createCar, updateCar, deleteCar, uploadCarImage, listAllBookings, analytics,
} from "../controllers/admin.controller.js";

const TYPES = ["Sedan", "SUV", "Sports", "Electric", "Compact"];
const LOCATIONS = ["Downtown Hub", "Airport North", "Central Station"];

const router = Router();

router.use(requireAuth, requireAdmin);
router.get("/cars", listFleet);
router.post(
  "/cars",
  validateBody({
    name: [rules.required("Name"), rules.isString("Name", { min: 2, max: 80 })],
    type: [rules.required("Type"), rules.isOneOf("Type", TYPES)],
    price: [rules.required("Price"), rules.isNumber("Price", { min: 1, max: 1000 })],
    location: [rules.required("Location"), rules.isOneOf("Location", LOCATIONS)],
    seats: [rules.isNumber("Seats", { min: 1, max: 15 })],
  }),
  createCar
);
router.patch("/cars/:id", updateCar);
router.delete("/cars/:id", deleteCar);
router.post("/cars/:id/image", carImageUpload.single("image"), uploadCarImage);
router.get("/bookings", listAllBookings);
router.get("/analytics", analytics);

export default router;
