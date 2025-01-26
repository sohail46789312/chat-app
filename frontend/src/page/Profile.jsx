import React, { useRef, useState } from 'react'
import { FaCamera, FaFacebook, FaGoogle } from "react-icons/fa";
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { google, signin, updateProfile } from '../features/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { PulseLoader } from 'react-spinners';
import Compressor from 'compressorjs';

const Profile = () => {
  const dispatch = useDispatch()

  const [name, setName] = useState()
  const [email, setEmail] = useState()
  const [image, setImage] = useState()

  const imageRef = useRef(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm()

  let { user, status, error } = useSelector((state) => state.auth)

  function handleFileInput(e) {
    let file = e.target.files[0];
    let reader = new FileReader();

    reader.onload = function (event) {
      setImage(event.target.result)
    };

    reader.readAsDataURL(file);
  }

  function handleImage() {
    imageRef.current.click()
  }

  async function onSubmit(data) {
    let compressedAvatar
    if (data.avatar) {
      compressedAvatar = await new Promise((resolve, reject) => {
        new Compressor(data.avatar, {
          maxWidth: 200,
          maxHeight: 200,
          success(result) {
            resolve(result);
          },
          error(err) {
            reject(err);
          },
        });
      });
    }

    let formData = {
      name: data.name || user.name,
      email: data.email || user.email,
      avatar: compressedAvatar
    }
    dispatch(updateProfile(formData))
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)" }} className='dark:bg-[#1A2236] dark:text-[#C6C8CD] flex flex-col items-center gap-8 pt-8'>
      <h1 className=' text-3xl font-bold'>Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} action="" className='flex flex-col gap-4 items-center'>
        <div className='relative'>
          <img className='w-28 h-28 object-cover rounded-full' src={image || user.avatar || "https://res.cloudinary.com/dioj83hyt/image/upload/v1734679232/Chat/if7zp2afhfxbnmk2vrvz.jpg"} alt="" />
          <div onClick={handleImage} className='w-7 cursor-pointer h-7 flex items-center justify-center rounded-full bg-[#1A2236] absolute right-2 bottom-1 dark:bg-white'>
            <FaCamera color='#0A80FF' className='' />
          </div>
        </div>
        <div>
          <input value={name} onChange={(e) => setName(e.target.value)} {...register("name")} className='bg-transparent p-3 rounded-md w-80 border-[1px] dark:border-white/10 border-black/30 placeholder-black/60 dark:placeholder-white/60' type="text" placeholder={user.name} />
        </div>
        <div>
          <input onChange={(e) => setEmail(e.target.value)} value={email} {...register("email")} className='bg-transparent p-3 rounded-md w-80 border-[1px] dark:border-white/10 border-black/30 placeholder-black/60 dark:placeholder-white/60' type="text" placeholder={user.email} />
          {errors.email && <p className='text-red-500 text-sm self-start pt-1'>{errors?.email.message}</p>}
        </div>
        <input hidden {...register("avatar")} onChange={(e) => {
          handleFileInput(e);
          setValue("avatar", e.target.files[0]);
        }} ref={imageRef} type="file" />
        <button className='dark:bg-[#0A80FF] p-3 rounded-md w-80 font-semibold bg-[#0A80FF] text-white'>{status === "loading" ? <PulseLoader color='white' size={"0.5em"} /> : "Update"}</button>
        <p className='pt-2 text-sm'><Link to={"/changepassword"} className='text-[#0A80FF]'>Change Password</Link></p>
      </form>
    </div>
  )
}

export default Profile
