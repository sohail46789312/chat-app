import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            default: "https://res.cloudinary.com/dioj83hyt/image/upload/v1736405698/default%20avatar.jpg"
        },
        resetPasswordToken: {
            type: String
        },
        resetPasswordExpire: {
            type: Date
        },
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "message"
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("user", userSchema);
export default User