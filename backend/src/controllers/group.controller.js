import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import Group from "../models/group.model.js";
import CustomError from "../utils/errorClass.js";

export const createGroup = catchAsyncError(async (req, res, next) => {
    try {
        let { members, name } = req.body
        console.log(req.body)
        let group = new Group({
            name,
            members
        })
        group.save()

        if(!group) {
            return next(new CustomError(400, "Failed to create Group"))
        }

        res.status(200).json(group)
    } catch (error) {
        console.log(error)
        return next(new CustomError(400, error.message))
    }
})