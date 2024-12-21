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
            default:
                "https://res.cloudinary.com/dioj83hyt/image/upload/v1734679232/Chat/if7zp2afhfxbnmk2vrvz.jpg",
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("user", userSchema);
export default User