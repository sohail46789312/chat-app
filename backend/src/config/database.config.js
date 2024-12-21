import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config();

async function connectDb() {
    try {
        const co = await mongoose.connect(process.env.DB_URI);
        console.log("MongoDb connected, Host: ", co.connection.host);
    } catch (error) {
        console.log("Error to connect to MongoDb: ", error)
    }

}

export default connectDb;
