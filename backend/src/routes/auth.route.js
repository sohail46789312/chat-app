import express from "express"
import { changePassword, failure, forgotPassword, getUser, getUsers, googleProfile, logout, resetPassword, signin, signUp, updateProfile, usersWithMessage } from "../controllers/auth.controller.js"
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
router.post("/forgotpassword", forgotPassword)
router.post("/resetpassword", resetPassword)
router.get("/all", isLoggedIn, getUsers)
router.post("/withmessage", isLoggedIn, usersWithMessage)

router.get("/googleprofile", googleProfile)
router.get("/failureredirect", failure)

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/api/v1/auth/googleprofile');
    });

export default router