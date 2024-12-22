import express from "express"
import { changePassword, getUser, googleProfile, logout, signin, signUp, updateProfile } from "../controllers/auth.controller.js"
import { isLoggedIn } from "../middlewares/auth.middleware.js"
import upload from "../utils/multer.js"
import passport from "passport"
const router = express.Router()

router.post("/signup", signUp)
router.post("/signin", signin)
router.get("/logout", isLoggedIn, logout)
router.get("/getuser", isLoggedIn, getUser)
router.post("/update", isLoggedIn, upload.single("avatar"), updateProfile)
router.post("/changepassword", isLoggedIn, changePassword)

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