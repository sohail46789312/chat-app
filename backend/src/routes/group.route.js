import express from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { createGroup } from "../controllers/group.controller.js";
const router = express.Router()

router.post("/create", isLoggedIn, createGroup)

export default router