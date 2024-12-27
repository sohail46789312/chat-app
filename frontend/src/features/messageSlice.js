import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

let BASE_URL = "http://localhost:3000/api/v1"

const initialState = {
    messages: [],
    users: [],
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
            return response.data
        } catch (error) {
            return rejectWithValue(error.response.data || error.message)
        }
    }
)

export const usersWithMessage = createAsyncThunk(
    "users/withmessage",
    async (data, { rejectWithValue }) => {
        try {
            let response = await axios.get(`${BASE_URL}/auth/withmessage/`, {
                withCredentials: true
            })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response.data || error.message)
        }
    }
)

export const getMessages = createAsyncThunk(
    "message/getmessages",
    async (data, { rejectWithValue }) => {
        try {
            let response = await axios.get(`${BASE_URL}/message/get/${data}`, {
                withCredentials: true
            })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response.data || error.message)
        }
    }
)

export const sendMessage = createAsyncThunk(
    "message/sendmessage",
    async (data, { rejectWithValue }) => {
        try {
            let formData = new FormData()

            formData.append("message", data.message)

            let response = await axios.post(`${BASE_URL}/message/create/${data.recieverId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            })

            return response.data
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
            .addCase(getUsers.pending, (state, action) => {
                state.status = "loading"
            })
            .addCase(getUsers.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.users = action.payload
            })
            .addCase(getUsers.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload
            })
            .addCase(usersWithMessage.pending, (state, action) => {
                state.status = "loading"
            })
            .addCase(usersWithMessage.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.users = action.payload
            })
            .addCase(usersWithMessage.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload
            })
            .addCase(getMessages.pending, (state, action) => {
                state.status = "loading"
            })
            .addCase(getMessages.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.messages = action.payload.messages
                state.u = action.payload.user
            })
            .addCase(getMessages.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload
            })
            .addCase(sendMessage.pending, (state, action) => {
                state.status = "loading"
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.status = "succeeded"
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload
            })
    }
})


export default messageSlice.reducer