import express from "express"
import { app, server } from "./utils/socket.js";

import cors from "cors"
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

import "./utils/googleStrategy.js"
import session from 'express-session';
app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

import authRoute from "./routes/auth.route.js"
import messageRoute from "./routes/message.route.js"

import dotenv from "dotenv"
dotenv.config()

import cookieParser from "cookie-parser"
app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

import connectDb from "./config/database.config.js"
connectDb()

app.use("/api/v1/auth", authRoute)
app.use("/api/v1/message", messageRoute)

import { ErrorMiddleware } from "./middlewares/error.middleware.js"
import passport from "passport";
app.use(ErrorMiddleware)

const port = process.env.PORT

server.listen(port, () => {
    console.log("server started on port: ", port)
})
