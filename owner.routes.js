import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { carImageUpload } from "../middleware/upload.middleware.js";
import { validateBody, rules } from "../middleware/validate.js";
import {
  myListings, createListing, updateListing, deleteListing, uploadListingImage,
  bookingRequests, approveBooking, declineBooking,
} from "../controllers/owner.controller.js";

const TYPES = ["Sedan", "SUV", "Sports", "Electric", "Compact"];
const LOCATIONS = ["Downtown Hub", "Airport North", "Central Station"];

const router = Router();

router.use(requireAuth);
router.get("/cars", myListings);
router.post(
  "/cars",
  validateBody({
    name: [rules.required("Name"), rules.isString("Name", { min: 2, max: 80 })],
    type: [rules.required("Type"), rules.isOneOf("Type", TYPES)],
    price: [rules.required("Price"), rules.isNumber("Price", { min: 1, max: 1000 })],
    location: [rules.required("Location"), rules.isOneOf("Location", LOCATIONS)],
    seats: [rules.isNumber("Seats", { min: 1, max: 15 })],
  }),
  createListing
);
router.patch("/cars/:id", updateListing);
router.delete("/cars/:id", deleteListing);
router.post("/cars/:id/image", carImageUpload.single("image"), uploadListingImage);
router.get("/bookings", bookingRequests);
router.patch("/bookings/:id/approve", approveBooking);
router.patch("/bookings/:id/decline", declineBooking);

export default router;
