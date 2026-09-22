import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody, rules } from "../middleware/validate.js";
import { createBooking, listMyBookings, getBooking, addMessage, cancelBooking } from "../controllers/bookings.controller.js";

const router = Router();

router.use(requireAuth);
router.get("/", listMyBookings);
router.post(
  "/",
  validateBody({
    carId: [rules.required("carId")],
    pickupDate: [rules.required("Pickup date")],
    dropoffDate: [rules.required("Return date")],
  }),
  createBooking
);
router.get("/:id", getBooking);
router.post(
  "/:id/messages",
  validateBody({ text: [rules.required("Message"), rules.isString("Message", { min: 1, max: 1000 })] }),
  addMessage
);
router.patch("/:id/cancel", cancelBooking);

export default router;
