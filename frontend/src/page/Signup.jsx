import React, { useState } from 'react'
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { google, signup } from '../features/authSlice';
import { PulseLoader } from 'react-spinners';
import { GoEyeClosed } from 'react-icons/go';
import { RxEyeOpen } from 'react-icons/rx';

const Signup = () => {
  const [pass, setPass] = useState(true)
  const { user, status, error } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm()

  const name = watch("name")
  const email = watch("email")
  const password = watch("password")

  let formData = {
    name,
    email,
    password
  }

  function onSubmit(data) {
    dispatch(signup(formData))
  }

  function handleGoogle() {
    dispatch(google())
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)" }} className='dark:bg-[#1A2236] dark:text-[#C6C8CD] flex flex-col items-center gap-8 pt-6'>
      <h1 className=' text-3xl font-bold '>Sign Up</h1>
      <form onSubmit={handleSubmit(onSubmit)} action="" className='flex flex-col gap-4 items-center'>
        <div>
          <input {...register("name", { required: "Name is required." })} className='bg-transparent p-3 rounded-md w-80 border-[1px] dark:border-white/10 border-black/30 placeholder-black/60 dark:placeholder-white/60' type="text" placeholder='Name' />
          {errors.name && <p className='text-red-500 text-sm self-start pt-1'>{errors?.name.message}</p>}
        </div>
        <div>
          <input {...register("email", { required: "Email is required." })} className='bg-transparent p-3 rounded-md w-80 border-[1px] dark:border-white/10 border-black/30 placeholder-black/60 dark:placeholder-white/60' type="text" placeholder='Email' />
          {errors.email && <p className='text-red-500 text-sm self-start pt-1'>{errors?.email.message}</p>}
        </div>
        <div className='relative'>
          <input {...register("password", { required: "Password is required.", minLength: { value: 6, message: "Password must be atleast 6 characters long." } })} className='bg-transparent p-3 rounded-md w-80 border-[1px] dark:border-white/10 border-black/30 placeholder-black/60 dark:placeholder-white/60' type={pass ? "password" : "text"} placeholder='Password' />
          {password ? (!pass ? (<GoEyeClosed onClick={() => setPass(!pass)} className='select-none absolute right-3 top-[18px]' />) : (<RxEyeOpen onClick={() => setPass(!pass)} className='select-none absolute right-3 top-[18px]' />)) : null}
          {errors.password && <p className='text-red-500 text-sm self-start pt-1'>{errors.password.message}</p>}
        </div>
        <p className='text-red-500'>{error}</p>
        <button className='dark:bg-[#0A80FF] p-3 rounded-md w-80 font-semibold bg-[#0A80FF] text-white'>{status === "loading" ? <PulseLoader color='white' size={"0.5em"} /> : "Sign Up"}</button>
      </form>
      <div className=' relative'>
        <div className='h-[1px] dark:bg-white/10 w-80 bg-black/30'></div>
        <p className='absolute -top-[13px] dark:bg-[#1A2236] bg-white px-2 left-[140px]'>Or</p>
      </div>
      <div className='w-80 flex flex-col items-center'>
        <button className='relative dark:bg-transparent flex items-center justify-center border-[1px] dark:border-white/10 p-3 rounded-md w-80 mb-2 border-black/30'>
          <FaFacebook color='#0A80FF' className='absolute left-3' size={"1.3em"} />
          <p className=''>Sign up with facebook</p>
        </button>
        <button onClick={handleGoogle} className='relative dark:bg-transparent flex items-center justify-center border-[1px] dark:border-white/10 p-3 rounded-md w-80 mb-2 border-black/30'>
          <FaGoogle color='#0A80FF' className='absolute left-3' size={"1.3em"} />
          <p className=''>Sign up with google</p>
        </button>
        <p className='pt-2 text-sm'>have an account? <Link to={"/signin"} className='text-[#0A80FF]'>Sign In</Link></p>
        <p className='pt-2 text-sm'><Link to={"/forgotpassword"} className='text-[#0A80FF]'>Forgot Password</Link></p>
      </div>
    </div>
  )
}

export default Signup
