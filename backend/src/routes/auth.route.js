import express from "express"
import { getUser, googleProfile, login, logout, signUp, updateProfile } from "../controllers/auth.controller.js"
import { isLoggedIn } from "../middlewares/auth.middleware.js"
import upload from "../utils/multer.js"
import passport from "passport"
const router = express.Router()

router.post("/signup", signUp)
router.post("/login", login)
router.get("/logout", logout)
router.get("/getuser", isLoggedIn, getUser)
router.post("/update", isLoggedIn, upload.single("avatar"), updateProfile)

router.get("/googleprofile", googleProfile)

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/api/v1/auth/googleprofile');
    });

export default router