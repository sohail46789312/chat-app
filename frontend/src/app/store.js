import { configureStore } from "@reduxjs/toolkit";
import authReduer from "../features/authSlice.js"
import messageReducer from "../features/messageSlice.js"
import { api } from "./api.js"

export const store = configureStore({
    reducer: {
        auth: authReduer,
        message: messageReducer,
        [api.reducerPath]: api.reducer
    },
    middleware: (getDefaultMiddleware) => [
        ...getDefaultMiddleware(),
        api.middleware,
    ],
})