import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: "https://res.cloudinary.com/dioj83hyt/image/upload/v1736923059/deafult%20group%20avatar.jpg"
        },
        latestMessage: {
            type: Object,
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            }
        ]
    },
    {
        timestamps: true,
    }
);

const Group = mongoose.model("group", groupSchema);
export default Group