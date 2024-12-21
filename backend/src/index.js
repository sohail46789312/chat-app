import express from "express"
const app = express()

import "./utils/googleStrategy.js"
import session from 'express-session';
app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

import authRoute from "./routes/auth.route.js"

import dotenv from "dotenv"
dotenv.config()

import cookieParser from "cookie-parser"
app.use(cookieParser())

app.use(express.json())

import connectDb from "./config/database.config.js"
connectDb()

app.use("/api/v1/auth", authRoute)

import { ErrorMiddleware } from "./middlewares/error.middleware.js"
import passport from "passport";
app.use(ErrorMiddleware)

const port = process.env.PORT

app.listen(port, () => {
    console.log("server started on port: ", port)
})
