import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios"

let BASE_URL = "http://localhost:3000/api/v1"

const initialState = {
    user: null,
    socket: null,
    status: null,
    error: null
}

export const signup = createAsyncThunk(
    "auth/signup",
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/signup`, data, {
                withCredentials: true
            })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response.data || error.message)
        }
    }
)

export const signin = createAsyncThunk(
    "auth/signin",
    async (data, { rejectWithValue }) => {
        try {
            let response = await axios.post(`${BASE_URL}/auth/signin`, data, {
                withCredentials: true
            })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response.data || error.message)
        }
    }
)

export const logout = createAsyncThunk(
    "user/logout",
    async (data, { rejectWithValue }) => {
        try {
            let response = await axios.get(`${BASE_URL}/auth/logout`, {
                withCredentials: true
            })
        } catch (error) {
            return (rejectWithValue(error.response.data || error.message))
        }
    }
)

export const google = createAsyncThunk(
    "user/google",
    async (data, { rejectWithValue }) => {
        try {
            window.location.href = "http://localhost:3000/api/v1/auth/google";
        } catch (error) {
            return (rejectWithValue(error.response.data || error.message))
        }
    }
)


export const getUser = createAsyncThunk(
    "user/get",
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/auth/getuser`, {
                withCredentials: true
            })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response.data || error.message)
        }
    }
)


export const updateProfile = createAsyncThunk(
    "user/update",
    async (data, { rejectWithValue }) => {
        try {
            let formData = new FormData()

            formData.append("name", data.name)
            formData.append("email", data.email)
            formData.append("avatar", data.avatar)

            const response = await axios.post(`${BASE_URL}/auth/update`, formData, {
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

export const changePassword = createAsyncThunk(
    "user/changepassword",
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/changepassword`, data, {
                withCredentials: true
            })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response.data || error.message)
        }
    }
)

export const forgotPassword = createAsyncThunk(
    "user/forgotpassword",
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/forgotpassword`, { email: data })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response.data || error.message)
        }
    }
)

export const resetPassword = createAsyncThunk(
    "user/resetpassword",
    async (data, { rejectWithValue }) => {
        try {
            let token = data.token
            let newPassword = data.newPassword
            let confirmPassword = data.confirmPassword
            const response = await axios.post(`${BASE_URL}/auth/resetpassword`, { token, newPassword, confirmPassword })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response.data || error.message)
        }
    }
)

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(signup.pending, (state, action) => {
                state.status = "loading"
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.user = action.payload
            })
            .addCase(signup.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload.message
            })
            .addCase(getUser.pending, (state, action) => {
                state.status = "loading"
            })
            .addCase(getUser.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.user = action.payload
            })
            .addCase(getUser.rejected, (state, action) => {
                state.status = "failed"
            })
            .addCase(signin.pending, (state, action) => {
                state.status = "loading"
            })
            .addCase(signin.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.user = action.payload
            })
            .addCase(signin.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload.message
            })
            .addCase(logout.pending, (state, action) => {
                state.status = "loading"
            })
            .addCase(logout.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.user = null
            })
            .addCase(logout.rejected, (state, action) => {
                state.status = "failed"
            })
            .addCase(google.pending, (state, action) => {
                state.status = "loading"
            })
            .addCase(google.fulfilled, (state, action) => {
                state.status = "succeeded"
            })
            .addCase(google.rejected, (state, action) => {
                state.status = "failed"
            })
            .addCase(updateProfile.pending, (state, action) => {
                state.status = "loading"
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.user = action.payload
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload
            })
            .addCase(changePassword.pending, (state, action) => {
                state.status = "loading"
            })
            .addCase(changePassword.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.user = action.payload
                state.error = null
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload
            })
            .addCase(forgotPassword.pending, (state, action) => {
                state.status = "loading"
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.status = "succeeded"
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.status = "failed"
            })
            .addCase(resetPassword.pending, (state, action) => {
                state.status = "loading"
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.user = action.payload
                state.error = null
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload
            })
    }
})

export default authSlice.reducer