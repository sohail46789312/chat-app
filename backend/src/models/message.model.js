import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    message: {
        type: String
    },
    file: {
        type: String
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId
    },
    recieverId: {
        type: mongoose.Schema.Types.ObjectId
    }
}, { timestamps: true })

const Message = mongoose.model("message", messageSchema)
export default Message
