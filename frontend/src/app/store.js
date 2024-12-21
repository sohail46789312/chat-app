import { configureStore } from "@reduxjs/toolkit";
import authReduer from "../features/authSlice.js"

export const store = configureStore({
    reducer: {
        auth: authReduer
    }
})