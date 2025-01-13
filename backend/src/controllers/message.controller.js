import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";
import CustomError from "../utils/errorClass.js";
import fs from "fs"
import { getRecieverSocketId, io } from "../utils/socket.js";
import Group from "../models/group.model.js";

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

        let group = await Group.findById(recieverId)

        if (group) {
            const roomId = `group-${group._id}`;
        
            group.members.forEach((member) => {
                const memberSocketId = getRecieverSocketId(member._id);
                if (memberSocketId) {
                    const socket = io.sockets.sockets.get(memberSocketId);
                    if (socket) {
                        socket.join(roomId);
                        console.log(`User ${member._id} added to room: ${roomId}`);
                    }
                }
            });
        
            group.members.forEach((member) => {
                if (member._id.toString() !== message.senderId.toString()) {
                    const memberSocketId = getRecieverSocketId(member._id);
                    if (memberSocketId) {
                        io.to(memberSocketId).emit("newGroupMessage", message);
                    }
                }
            });
        
            return;
        }
        
        const recieverSocketId = getRecieverSocketId(recieverId)
        console.log(recieverSocketId)
        if (recieverSocketId) {
            io.to(recieverSocketId).emit("newMessage", message)
        }


        res.status(200).json(message)
    } catch (error) {
        return next(new CustomError(500, error.message))
    }
})

export const getMessage = catchAsyncError(async (req, res, next) => {
    try {
        let messages

        let user = await User.findById(req.params.recieverId)
        let group = await Group.findById(req.params.recieverId)
        if(!user) {
            messages = await Message.find({recieverId: req.params.recieverId})
            res.status(200).json({ messages, user: group })
            return
        }

        messages = await Message.find({
            $or: [
                { recieverId: req.params.recieverId, senderId: req.user._id },
                { recieverId: req.user._id, senderId: req.params.recieverId }
            ]
        });

        res.status(200).json({ messages, user })
    } catch (error) {
        return next(new CustomError(500, error.message))
    }
})