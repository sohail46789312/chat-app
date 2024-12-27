import React, { useRef, useState } from 'react'
import { FaCamera, FaFacebook, FaGoogle } from "react-icons/fa";
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { changePassword, forgotPassword, google, signin, updateProfile } from '../features/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { PulseLoader } from 'react-spinners';
import { GoEyeClosed } from 'react-icons/go';
import { RxEyeOpen } from 'react-icons/rx';

const ForgotPassword = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    let { user, status, error } = useSelector((state) => state.auth)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm()

    let email = watch("email")

    async function onSubmit() {
        await dispatch(forgotPassword(email))
        navigate("/resetpassword")
    }

    return (
        <div className='dark:bg-[#1A2236] dark:text-[#C6C8CD] h-screen flex flex-col items-center gap-8 pt-8'>
            <h1 className=' text-3xl font-bold'>Reset Password</h1>
            <form onSubmit={handleSubmit(onSubmit)} action="" className='flex flex-col gap-4 items-center'>
                    <p className='w-80 text-center text-green-800'>Enter your email so we can send reset password link to you</p>
                <div className='relative'>
                    <input value={email || ""} {...register("email")} className='bg-transparent p-3 rounded-md w-80 border-[1px] dark:border-white/10 border-black/30 placeholder-black/60 dark:placeholder-white/60' placeholder="Enter Email" />
                </div>
                <p className='text-red-500'>{error?.message}</p>
                <button className='dark:bg-[#0A80FF] p-3 rounded-md w-80 font-semibold bg-[#0A80FF] text-white'>{status === "loading" ? <PulseLoader color='white' size={"0.5em"} /> : "Send"}</button>
            </form>
        </div>
    )
}

export default ForgotPassword
