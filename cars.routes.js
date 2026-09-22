import { Router } from "express";
import { listCars, getCar } from "../controllers/cars.controller.js";

const router = Router();

router.get("/", listCars);
router.get("/:id", getCar);

export default router;
