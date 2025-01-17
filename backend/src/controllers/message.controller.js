import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";
import CustomError from "../utils/errorClass.js";
import fs from "fs"
import { getRecieverSocketId, io } from "../utils/socket.js";
import Group from "../models/group.model.js";
import path from "path";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createMessage = catchAsyncError(async (req, res, next) => {
    try {
        let senderId = req.user._id
        let recieverId = req.params.recieverId

        let folder = `chat/message/${senderId}`

        let message

        if (req.file) {
            console.log(req.file)

            let result = await cloudinary.uploader.upload(req.file.path, {
                resource_type: "auto",
                folder,
                public_id: senderId
            })

            console.log(result)

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
                file: {secure_url: result.secure_url, resource_type: result.is_audio ? "audio" : result.resource_type}
            })

            await message.save()

            message = await Message.findById(message._id).populate("senderId", "avatar")

            let group = await Group.findById(recieverId)

            if (group) {
                const roomId = `group-${group._id}`;

                group.members.forEach((member) => {
                    const memberSocketId = getRecieverSocketId(member._id);
                    if (memberSocketId) {
                        const socket = io.sockets.sockets.get(memberSocketId);
                        if (socket) {
                            socket.join(roomId);
                        }
                    }
                });

                group.members.forEach((member) => {
                    if (member._id.toString() !== message.senderId._id.toString()) {
                        const memberSocketId = getRecieverSocketId(member._id);
                        if (memberSocketId) {
                            io.to(memberSocketId).emit("newGroupMessage", message);
                        }
                    }
                });

                return;
            }

            const recieverSocketId = getRecieverSocketId(recieverId)
            if (recieverSocketId) {
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

        message = await Message.findById(message._id).populate("senderId", "avatar")

        let group = await Group.findById(recieverId)

        if (group) {
            const roomId = `group-${group._id}`;

            group.members.forEach((member) => {
                const memberSocketId = getRecieverSocketId(member._id);
                if (memberSocketId) {
                    const socket = io.sockets.sockets.get(memberSocketId);
                    if (socket) {
                        socket.join(roomId);
                    }
                }
            });

            group.members.forEach((member) => {
                if (member._id.toString() !== message.senderId._id.toString()) {
                    const memberSocketId = getRecieverSocketId(member._id);
                    if (memberSocketId) {
                        io.to(memberSocketId).emit("newGroupMessage", message);
                    }
                }
            });

            return;
        }

        const recieverSocketId = getRecieverSocketId(recieverId)
        if (recieverSocketId) {
            io.to(recieverSocketId).emit("newMessage", message)
        }


        res.status(200).json(message)
    } catch (error) {
        console.log(error)
        return next(new CustomError(500, error.message))
    }
})

export const getMessage = catchAsyncError(async (req, res, next) => {
    try {
        let messages

        let user = await User.findById(req.params.recieverId)
        let group = await Group.findById(req.params.recieverId)
        if (!user) {
            messages = await Message.find({ recieverId: req.params.recieverId }).populate("senderId", "avatar")
            res.status(200).json({ messages, user: group })
            return
        }

        messages = await Message.find({
            $or: [
                { recieverId: req.params.recieverId, senderId: req.user._id },
                { recieverId: req.user._id, senderId: req.params.recieverId }
            ]
        }).populate("senderId", "avatar").populate("recieverId", "avatar")

        res.status(200).json({ messages, user })
    } catch (error) {
        return next(new CustomError(500, error.message))
    }
})