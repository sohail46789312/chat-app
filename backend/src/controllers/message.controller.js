import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import Message from "../models/message.model.js";
import cloudinary from "../utils/cloudinary.js";
import CustomError from "../utils/errorClass.js";
import fs from "fs"

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

            res.status(200).json(message)
            return
        }

        message = new Message({
            senderId,
            recieverId,
            message: req.body.message
        })

        await message.save()

        res.status(200).json(message)
    } catch (error) {
        console.log("error in createMessage controller")
        return next(new CustomError(500, error.message))
    }
})

export const getMessage = catchAsyncError(async (req, res, next) => {
    console.log(req.user._id)
    console.log(req.params.recieverId)
    try {
        let messages = await Message.find({
            $or: [
                {recieverId: req.params.recieverId, senderId: req.user._id},
                {recieverId: req.user._id, senderId: req.params.recieverId}
            ]
        });

        res.status(200).json(messages)
    } catch (error) {
        console.log("errro in getMessage controller", error)
        return next(new CustomError(500, error.message))
    }
})