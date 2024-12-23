import express from "express"
import { createMessage, getMessage } from "../controllers/message.controller.js"
import { isLoggedIn } from "../middlewares/auth.middleware.js"
import upload from "../utils/multer.js"
const router = express.Router()

router.post("/create/:recieverId", isLoggedIn, upload.single("file"), createMessage)
router.get("/get/:recieverId", isLoggedIn, getMessage)

export default router