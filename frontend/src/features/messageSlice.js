import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

let BASE_URL = "http://localhost:3000/api/v1"

const initialState = {
    users: [],
    prevUsers: [],
    u: null,
    status: null,
    error: null
}

export const getUsers = createAsyncThunk(
    "users/get",
    async (data, { rejectWithValue }) => {
        try {
            let response = await axios.get(`${BASE_URL}/auth/all/?keyword=${data}`, {
                withCredentials: true
            })
            return response.data.user
        } catch (error) {
            return rejectWithValue(error.response.data || error.message)
        }
    }
)

export const usersWithMessage = createAsyncThunk(
    "users/withmessage",
    async (data, { rejectWithValue }) => {
        try {
            return data
        } catch (error) {
            return rejectWithValue(error.response.data || error.message)
        }
    }
)

export const messageSlice = createSlice({
    name: "message",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getUsers.fulfilled, (state, action) => {
                state.users = action.payload
            })
            .addCase(getUsers.rejected, (state, action) => {
                state.error = action.payload
            })
            .addCase(usersWithMessage.pending, (state, action) => {
                state.status = "loading"
            })
            .addCase(usersWithMessage.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.users = action.payload
                state.prevUsers = action.payload
            })
            .addCase(usersWithMessage.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload
            })
    }
})


export default messageSlice.reducer