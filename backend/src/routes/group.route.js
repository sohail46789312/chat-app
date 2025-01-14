import express from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import { createGroup } from "../controllers/group.controller.js";
import upload from "../utils/multer.js";
const router = express.Router()

router.post("/create", isLoggedIn, upload.single("avatar"), createGroup)

export default router