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
        },
        resetPasswordToken: {
            type: String
        },
        resetPasswordExpire: {
            type: Date
        }
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("user", userSchema);
export default User