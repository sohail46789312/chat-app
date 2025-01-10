import React, { useRef, useState } from 'react'
import { FaCamera, FaFacebook, FaGoogle } from "react-icons/fa";
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { changePassword, google, resetPassword, signin, updateProfile } from '../features/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { PulseLoader } from 'react-spinners';
import { GoEyeClosed } from 'react-icons/go';
import { RxEyeOpen } from 'react-icons/rx';

const ResetPassword = () => {
    const dispatch = useDispatch()
    let { user, status, error } = useSelector((state) => state.auth)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm()

    let token = watch("token")
    let newPassword = watch("newPassword")
    let confirmPassword = watch("confirmPassword")

    function onSubmit() {
        dispatch(resetPassword({token, newPassword, confirmPassword}))
    }

    return (
        <div style={{height: "calc(100vh - 64px)"}} className='dark:bg-[#1A2236] dark:text-[#C6C8CD] flex flex-col items-center gap-8 pt-8'>
            <h1 className=' text-3xl font-bold'>Change Password</h1>
            <form onSubmit={handleSubmit(onSubmit)} action="" className='flex flex-col gap-4 items-center'>
                <div className='relative'>
                    <input value={token} {...register("token")} className='bg-transparent p-3 rounded-md w-80 border-[1px] dark:border-white/10 border-black/30 placeholder-black/60 dark:placeholder-white/60' placeholder="Token" />
                </div>
                <div className='relative'>
                    <input value={newPassword} {...register("newPassword")} className='bg-transparent p-3 rounded-md w-80 border-[1px] dark:border-white/10 border-black/30 placeholder-black/60 dark:placeholder-white/60' placeholder="New Passsword" />
                </div>
                <div className='relative'>
                    <input value={confirmPassword} {...register("confirmPassword")} className='bg-transparent p-3 rounded-md w-80 border-[1px] dark:border-white/10 border-black/30 placeholder-black/60 dark:placeholder-white/60' placeholder="Confirm Password" />
                </div>
                <p className='text-red-500'>{error?.message}</p>
                <button className='dark:bg-[#0A80FF] p-3 rounded-md w-80 font-semibold bg-[#0A80FF] text-white'>{status === "loading" ? <PulseLoader color='white' size={"0.5em"} /> : "Update"}</button>
            </form>
        </div>
    )
}

export default ResetPassword
