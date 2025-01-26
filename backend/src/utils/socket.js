import { Server } from "socket.io";
import http from "http"
import express from "express"

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
})

export function getRecieverSocketId (userId) {
    return userSocketMap[userId]
}

const userSocketMap = {}

io.on("connection", (socket) => {
    console.log("a user connected", socket.id)

    socket.emit("me", socket.id)

    socket.on("callToUser", (data) => {
        let userSocketId = getRecieverSocketId(data.callToUserId)
        if(userSocketId){
            io.to(userSocketId).emit("calling", {
                signal: data.signalData,
                from: data.from,
                name: data.name
            })
        }
    })

    socket.on("rejectcall", (data) => {
        io.to(data.to).emit("callrejected", {name: data.name})
    })

    socket.on("callaccepted", (data) => {
        io.to(data.to).emit("acceptsignal", { signal: data.signal, from: data.from })
    })

    socket.on("callended", (data) => {
        io.to(data.to).emit("callended", {name: data.name})
    })

    const userId = socket.handshake.query.userId

    if(userId) userSocketMap[userId] = socket.id

    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("disconnect", () => {
        console.log("a user disconnected", socket.id)
        delete userSocketMap[userId]

        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

export { io, app, server }