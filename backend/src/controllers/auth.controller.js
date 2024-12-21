import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import User from "../models/user.model.js"
import CustomError from "../utils/errorClass.js"
import { sendToken } from "../utils/sendToken.js"
import bcryptjs from "bcryptjs"
import cloudinary from "../utils/cloudinary.js"
import fs from "fs"
import crypto from "crypto"

export const signUp = catchAsyncError(async (req, res, next) => {
    let { name, email, password } = req.body
    try {
        if (!name || !email || !password) {
            return next(new CustomError(400, "Please fill all fields."))
        }

        if (password.length < 6) {
            return next(new CustomError(400, "Password must be atleast 6 characters."))
        }

        let user = await User.findOne({ email })

        if (user) {
            return next(new CustomError(400, "This email already exists."))
        }

        let hashedPassword = await bcryptjs.hash(password, 10)

        user = new User({
            name,
            email,
            password: hashedPassword
        })

        await user.save()

        sendToken(res, user._id)

        res.status(200).json(user)
    } catch (error) {
        console.log("error in signUp controller", error)
        return next(new CustomError(500, "internal server error"))
    }
})

export const login = catchAsyncError(async (req, res, next) => {
    let { email, password } = req.body
    try {
        if (!email || !password) {
            return next(new CustomError(400, "Please fill all fields."))
        }

        let user = await User.findOne({ email })

        if (!user) {
            return next(new CustomError(400, "Invalid credentials."))
        }

        let isPasswordMatch = await bcryptjs.compare(password, user.password)

        if (!isPasswordMatch) {
            return next(new CustomError(400, "Invalid credentials."))
        }

        sendToken(res, user._id)

        res.status(200).json(user)
    } catch (error) {
        console.log("error in login controller", error)
        return next(new CustomError(500, "internal server error"))
    }
})

export const logout = catchAsyncError(async (req, res, next) => {
    try {
        res.cookie("token", "", {
            maxAge: 0
        })

        res.status(200).json({
            success: true,
            message: "Logged out successfully."
        })
    } catch (error) {
        console.log("error in logout controller", error)
        return next(new CustomError(500, "internal server error"))
    }
})

export const getUser = catchAsyncError(async (req, res, next) => {
    try {
        let user = req.user

        res.status(200).json(user)
    } catch (error) {
        console.log("error in getuser controller", error)
        return next(new CustomError(500, "internal server error"))
    }
})

export const updateProfile = catchAsyncError(async (req, res, next) => {
    try {
        let user = req.user

        let folder = `chat/profile/${user._id}`

        if (!req.file) {
            return next(new CustomError(400, "Picture is required."))
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder,
            public_id: user._id
        });

        if (!result) {
            return next(new CustomError(400, "Failed to upload to cloudinary."))
        }

        fs.unlink(req.file.path, (err) => {
            if (err) {
                return next(new CustomError(400, "Failed to delete file from storage."))
            }
        });

        let updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    avatar: result.secure_url
                }
            },
            { new: true }
        )

        if (!updatedUser) {
            return next(new CustomError(400, "Failed to upload profile picture."))
        }

        res.status(200).json(updatedUser)
    } catch (error) {
        console.log("error in updateProfile controller", error)
        return next(new CustomError(500, "internal server error"))
    }
})

export const googleProfile = catchAsyncError(async (req, res, next) => {
    let { name, email, picture } = req.user._json
    try {
        let user = await User.findOne({ email })

        if (user) {
            res.status(200).json(user)
            return
        }

        const randomPassword = crypto.randomBytes(16).toString('hex');

        let hashedPassword = await bcryptjs.hash(randomPassword, 10)

        user = new User({
            name,
            email,
            avatar: picture,
            password: hashedPassword
        })

        await user.save()

        sendToken(res, user._id)

        res.status(200).json(user)
    } catch (error) {
        console.log("error in signUp controller", error)
        return next(new CustomError(500, "internal server error"))
    }
})