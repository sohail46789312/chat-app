import React, { useRef, useState } from 'react'
import { FaCamera, FaFacebook, FaGoogle } from "react-icons/fa";
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { changePassword, google, resetPassword, signin, updateProfile } from '../features/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { PulseLoader } from 'react-spinners';
import { GoEyeClosed } from 'react-icons/go';
import { RxEyeOpen } from 'react-icons/rx';

const ResetPassword = () => {
    const dispatch = useDispatch()

    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm()

    let newPassword = watch("newPassword")
    let confirmPassword = watch("confirmPassword")
    let { token } = useParams("token")

    let { user, status, error } = useSelector((state) => state.auth)

    function onSubmit() {
        dispatch(resetPassword({ token, newPassword, confirmPassword }))
    }

    return (
        <div style={{ minHeight: "calc(100vh - 64px)" }} className='dark:bg-[#1A2236] dark:text-[#C6C8CD] flex flex-col items-center gap-8 pt-8'>
            <h1 className=' text-3xl font-bold'>Reset Password</h1>
            <form onSubmit={handleSubmit(onSubmit)} action="" className='flex flex-col gap-4 items-center'>
                <div className='relative'>
                    <input type={showNewPassword ? "text" : "password"} {...register("newPassword", { required: "New Password is required" })} className='bg-transparent p-3 rounded-md w-80 border-[1px] dark:border-white/10 border-black/30 placeholder-black/60 dark:placeholder-white/60' placeholder="New Passsword" />
                    {newPassword ? (showNewPassword ? <GoEyeClosed onClick={() => setShowNewPassword(!showNewPassword)} className='select-none absolute right-3 top-[18px]' /> : <RxEyeOpen onClick={() => setShowNewPassword(!showNewPassword)} className='select-none absolute right-3 top-[18px]' />) : null}
                </div>
                <div className='relative'>
                    <input type={showConfirmPassword ? "text" : "password"} {...register("confirmPassword", { required: "New Password is required" })} className='bg-transparent p-3 rounded-md w-80 border-[1px] dark:border-white/10 border-black/30 placeholder-black/60 dark:placeholder-white/60' placeholder="Confirm Password" />
                    {confirmPassword ? (showConfirmPassword ? <GoEyeClosed onClick={() => setShowConfirmPassword(!showConfirmPassword)} className='select-none absolute right-3 top-[18px]' /> : <RxEyeOpen onClick={() => setShowConfirmPassword(!showConfirmPassword)} className='select-none absolute right-3 top-[18px]' />) : null}
                </div>
                <p className='text-red-500'>{error?.message}</p>
                <button className='dark:bg-[#0A80FF] p-3 rounded-md w-80 font-semibold bg-[#0A80FF] text-white'>{status === "loading" ? <PulseLoader color='white' size={"0.5em"} /> : "Update"}</button>
            </form>
        </div>
    )
}

export default ResetPassword
