import { configureStore } from "@reduxjs/toolkit";
import authReduer from "../features/authSlice.js"
import messageReducer from "../features/messageSlice.js"

export const store = configureStore({
    reducer: {
        auth: authReduer,
        message: messageReducer
    }
})