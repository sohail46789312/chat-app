import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import User from "../models/user.model.js"
import CustomError from "../utils/errorClass.js"
import { sendToken } from "../utils/sendToken.js"
import bcryptjs from "bcryptjs"
import cloudinary from "../utils/cloudinary.js"
import fs from "fs"
import crypto from "crypto"
import sendMail from "../utils/sendMail.js"
import Message from "../models/message.model.js"
import Group from "../models/group.model.js"

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

export const signin = catchAsyncError(async (req, res, next) => {
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

        let updatedUser

        if (req.file) {
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

            updatedUser = await User.findByIdAndUpdate(
                user._id,
                {
                    $set: {
                        avatar: result.secure_url,
                        name: req.body.name,
                        email: req.body.email
                    }
                },
                { new: true }
            )
        } else {
            updatedUser = await User.findByIdAndUpdate(
                user._id,
                {
                    $set: {
                        name: req.body.name,
                        email: req.body.email
                    }
                },
                { new: true }
            )
        }

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
            sendToken(res, user._id)
            res.redirect("http://localhost:5173")
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
        res.redirect("http://localhost:5173")
    } catch (error) {
        console.log("error in signUp controller", error)
        return next(new CustomError(500, "internal server error"))
    }
})

export const failure = catchAsyncError(async (req, res, next) => {
    res.redirect("http://localhost:5173")
})

export const changePassword = catchAsyncError(async (req, res, next) => {
    try {
        let { oldPassword, newPassword, confirmPassword } = req.body
        let userId = req.user._id
        let user = await User.findById(userId)
        if (!user) {
            return next(new CustomError(400, "User not found"))
        }

        let isPasswordMatced = await bcryptjs.compare(oldPassword, user.password)

        if (!isPasswordMatced) {
            return next(new CustomError(400, "Old password is incorrect."))
        }

        if (newPassword !== confirmPassword) {
            return next(new CustomError(400, "Password doest not match."))
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        res.status(200).json(user)
    } catch (error) {
        return next(new CustomError(500, error.message))
    }
})

export const forgotPassword = catchAsyncError(async (req, res, next) => {
    let user
    try {
        let user = await User.findOne({ email: req.body.email })
        if (!user) {
            return next(new CustomError(400, "user not found with this email"))
        }

        const resetPasswordToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetPasswordToken
        user.resetPasswordExpire = Date.now() + 1000 * 60 * 30

        await user.save()

        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/ /${resetPasswordToken}`;
        const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`

        await sendMail({
            email: user.email,
            subject: 'Express Blog Password Recovery',
            message
        })
        res.status(200).json({
            message: "Email send successfully."
        })
    } catch (error) {
        console.log(error)
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({ validateBeforeSave: false });
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
})

export const resetPassword = catchAsyncError(async (req, res, next) => {
    let user
    try {
        const user = await User.findOne({
            resetPasswordToken: req.body.token,
            resetPasswordExpire: { $gt: Date.now() }
        })


        if (!user) {
            return next(new CustomError(400, "user not found invalid token"))
        }

        if (req.body.newPassword !== req.body.confirmPassword) {
            return next(new CustomError(400, "password does not match"))
        }

        let hashedPassword = await bcryptjs.hash(req.body.newPassword, 10)

        user.password = hashedPassword

        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save()
        res.status(200).json(user)
    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({ validateBeforeSave: false });
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
})

export const getUsers = catchAsyncError(async (req, res, next) => {
    try {
        let user = await User.find({ email: { $regex: req.query.keyword, $options: "i" } })

        let message = await Message.find({
            $or: [
                { recieverId: user?._id, senderId: req.user._id },
                { recieverId: req.user._id, senderId: user?._id }
            ]
        });

        let usersWithoutMe = user.filter(user => user._id.toString() !== req.user._id.toString())

        let latestMessage = message.pop()

        res.status(200).json({ user: usersWithoutMe, latestMessage })
    } catch (error) {
        console.log("error in getUsers controller", error)
        return next(new CustomError(500, error.message))
    }
})

export const usersWithMessage = catchAsyncError(async (req, res, next) => {
    try {
        let messages = await Message.find({
            $or: [
                { senderId: req.user._id },
                { recieverId: req.user._id }
            ]
        });

        let users = await User.find()

        async function userLatestMessage() {
            for (const user of users) {
                let latestMessageFilter = messages.filter(m => m.senderId.toString() === user._id.toString() || m.recieverId.toString() === user._id.toString())
                let latestM = latestMessageFilter.pop()
                user.latestMessage = latestM
                await user.save()
            }
        }
        await userLatestMessage()

        let groups = await Group.find({ members: req.user._id })

        const sortedUsers = users.sort((a, b) =>
            new Date(b.latestMessage?.createdAt) - new Date(a.latestMessage?.createdAt)
        );

        let usersWithoutMe = sortedUsers.filter(user => user._id.toString() !== req.user._id.toString())

        let filteredUsers = usersWithoutMe.filter(user => user.latestMessage?.senderId?.toString() === req.user._id.toString() || user.latestMessage?.recieverId?.toString() === req.user._id.toString())
        filteredUsers.push(...groups)

        res.status(200).json(filteredUsers)
    } catch (error) {
        console.log("error in usersWithMessage controller", error)
        return next(new CustomError(500, error.message))
    }
})