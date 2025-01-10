import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import CustomError from "../utils/errorClass.js"

export const isLoggedIn = async (req, res, next) => {
    let token = req.cookies.token
    if(!token) {
        return next(new CustomError(400, "You need to login first."))
    }
    let decodedToken = jwt.verify(token, process.env.JWT_SECRET)

    let { id } = decodedToken

    let user = await User.findById(id)

    if(!user) {
        return next(new CustomError(400, "invalid token, unauthorized"))
    }

    req.user = user

    next()
}