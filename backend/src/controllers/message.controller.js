import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";
import CustomError from "../utils/errorClass.js";
import fs from "fs"
import { getRecieverSocketId, io } from "../utils/socket.js";

export const createMessage = catchAsyncError(async (req, res, next) => {
    try {
        let senderId = req.user._id
        let recieverId = req.params.recieverId

        let folder = `chat/message/${senderId}`

        let message

        if (req.file) {
            let result = await cloudinary.uploader.upload(req.file.path, {
                folder,
                public_id: senderId
            })

            if (!result) {
                return next(new CustomError(400, "Failed to upload to cloudinary."))
            }

            fs.unlink(req.file.path, (err) => {
                if (err) {
                    return next(new CustomError(400, "Failed to delete file from storage."))
                }
            });

            message = new Message({
                senderId,
                recieverId,
                message: req.body.message,
                file: result.secure_url
            })

            await message.save()

            const recieverSocketId = getRecieverSocketId(recieverId)
            if (recieverSocketId) {
                console.log(recieverSocketId)
                io.to(recieverSocketId).emit("newMessage", message)
            }

            res.status(200).json(message)
            return
        }

        message = new Message({
            senderId,
            recieverId,
            message: req.body.message
        })

        await message.save()

        let user1 = await User.findById(senderId)
        let user2 = await User.findById(recieverId)

        user1.latestMessage = message
        user2.latestMessage = message

        await user1.save()
        await user2.save()

        const recieverSocketId = getRecieverSocketId(recieverId)
        console.log(1111, recieverSocketId)
        if (recieverSocketId) {
            io.emit("newMessage", message)
        }

        res.status(200).json(message)
    } catch (error) {
        console.log("error in createMessage controller")
        return next(new CustomError(500, error.message))
    }
})

export const getMessage = catchAsyncError(async (req, res, next) => {
    try {
        let messages = await Message.find({
            $or: [
                { recieverId: req.params.recieverId, senderId: req.user._id },
                { recieverId: req.user._id, senderId: req.params.recieverId }
            ]
        });

        let user = await User.findById(req.params.recieverId)

        res.status(200).json({ messages, user })
    } catch (error) {
        console.log("errro in getMessage controller", error)
        return next(new CustomError(500, error.message))
    }
})