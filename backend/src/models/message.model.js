import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    message: {
        type: String
    },
    file: {
        type: String
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    recieverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    isGroup: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const Message = mongoose.model("message", messageSchema)
export default Message