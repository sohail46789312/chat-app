import mongoose from "mongoose";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import Group from "../models/group.model.js";
import CustomError from "../utils/errorClass.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs"
import { getRecieverSocketId, io } from "../utils/socket.js";

export const createGroup = catchAsyncError(async (req, res, next) => {
    try {
        let { name } = req.body
        let members = JSON.parse(req.body.members).map((member) => new mongoose.Types.ObjectId(member))
        if (!name || !members) {
            return next(new CustomError(400, "Please provide name for group"))
        }
        if (members.length < 2) {
            return next(new CustomError(400, "Please add at leat 2 members"))
        }
        let group = new Group({
            name,
            members
        })

        let folder = `chat/group/${name + Math.random() + req.user._id}`

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder,
                public_id: name + Math.random() + req.user._id
            });

            if (!result) {
                return next(new CustomError(400, "Failed to upload to cloudinary."))
            }

            fs.unlink(req.file.path, (err) => {
                if (err) {
                    return next(new CustomError(400, "Failed to delete file from storage."))
                }
            });

            group = new Group({
                name,
                members,
                avatar: result.secure_url
            })

            group.save()
        
            group.members.forEach((member) => {
                console.log(member)
                    const memberSocketId = getRecieverSocketId(member._id);
                    console.log(memberSocketId)
                    if (memberSocketId) {
                        io.to(memberSocketId).emit("newGroupCreated", req.user._id);
                    }
            });

            if (!group) {
                return next(new CustomError(400, "Failed to create Group"))
            }
            res.status(200).json(group)
            return
        }

        group = new Group({
            name,
            members
        })

        group.save()

        if (!group) {
            return next(new CustomError(400, "Failed to create Group"))
        }

        group.members.forEach((member) => {
            console.log(member)
                const memberSocketId = getRecieverSocketId(member._id);
                console.log(memberSocketId)
                if (memberSocketId) {
                    io.to(memberSocketId).emit("newGroupCreated", req.user._id);
                }
        });

        res.status(200).json(group)
    } catch (error) {
        console.log(error)
        return next(new CustomError(400, error.message))
    }
})