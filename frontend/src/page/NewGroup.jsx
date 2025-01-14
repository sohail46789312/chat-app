import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usersWithMessage } from '../features/messageSlice';
import { Link, useNavigate } from 'react-router-dom';
import { PulseLoader } from 'react-spinners';
import { useCreateGroupMutation, useUsersWithMessagesQuery } from '../app/api';
import { CgAdd } from 'react-icons/cg';
import { IoIosAdd, IoIosRemove } from 'react-icons/io';
import { useForm } from 'react-hook-form';
import { FaCamera } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Home = ({ socket }) => {
  const { users, status } = useSelector((state) => state.message);
  const [uusers, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const navigate = useNavigate()

  const { data, isError, isLoading, refetch } = useUsersWithMessagesQuery();

  useEffect(() => {
    setUsers(users);
  }, [users]);

  const dispatch = useDispatch()
  let { user, error } = useSelector((state) => state.auth)
  const [name, setName] = useState()
  const [email, setEmail] = useState()
  const [image, setImage] = useState()

  const imageRef = useRef(null)

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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm()

  const [createGroup, {isLoading: creatingGroup}] = useCreateGroupMutation()

  async function onSubmit(data) {
    members.push(user._id)
    let formData = {
      name: data.name,
      avatar: data.avatar,
      members
    }
    try {
      await createGroup(formData).unwrap()
      toast.success("Group created successfully")
      navigate("/")
    } catch (error) {
      toast.error(error.data.message)
    }
  }

  function handleMembers(userId) {
    setMembers((prev) => prev.includes(userId) ? prev.filter((member) => member !== userId) : [...prev, userId])
  }

  return (
    <div
      className="dark:bg-[#1A2236] dark:text-white flex flex-col items-center pt-4 gap-4"
      style={{ minHeight: 'calc(100vh - 64px)' }}
    >
      <h1 className=' text-3xl font-bold pb-4'>Create New Group</h1>
      <form onSubmit={handleSubmit(onSubmit)} action="" className='flex flex-col gap-4 items-center'>
        <div className='relative'>
          <img className='w-28 h-28 rounded-full object-cover' src={image || user.avatar || "https://res.cloudinary.com/dioj83hyt/image/upload/v1734679232/Chat/if7zp2afhfxbnmk2vrvz.jpg"} alt="" />
          <div onClick={handleImage} className='w-7 cursor-pointer h-7 flex items-center justify-center rounded-full bg-[#1A2236] absolute right-2 bottom-1 dark:bg-white'>
            <FaCamera color='#0A80FF' className='' />
          </div>
        </div>
        <div>
          <input value={name} onChange={(e) => setName(e.target.value)} {...register("name")} className='bg-transparent p-3 rounded-md w-80 border-[1px] dark:border-white/10 border-black/30 placeholder-black/60 dark:placeholder-white/60' type="text" placeholder="Name" />
        </div>
        <input hidden {...register("avatar")} onChange={(e) => {
          handleFileInput(e);
          setValue("avatar", e.target.files[0]);
        }} ref={imageRef} type="file" />
        <button className='dark:bg-[#0A80FF] p-3 rounded-md w-80 font-semibold bg-[#0A80FF] text-white'>{creatingGroup ? <PulseLoader color='white' size={"0.5em"} /> : "Create Group"}</button>
      </form>
      {!isLoading && Array.isArray(uusers) && uusers[0] !== null ? (
        uusers.map((user, i) => {
          return (
            <div
              key={i}
              className="cursor-pointer flex w-80 justify-between items-center pt-6"
            >
              <div className="flex gap-3 items-center">
                <img
                  className="w-14 h-14 rounded-full"
                  src={
                    user?.avatar ||
                    'https://res.cloudinary.com/dioj83hyt/image/upload/v1734679232/Chat/if7zp2afhfxbnmk2vrvz.jpg'
                  }
                  alt=""
                />
                <div>
                  <h2 className="font-semibold">
                    {user?.name}
                  </h2>
                </div>
              </div>
              <div className="flex gap-1 flex-col items-end">
                {!members.includes(user._id) ? <p onClick={() => handleMembers(user._id)} className="bg-[#0A80FF] text-xs rounded-full flex items-center justify-center text-white">
                  <IoIosAdd size={"1.7em"} />
                </p> : <p onClick={() => handleMembers(user._id)} className="bg-[#ff0a0a] text-xs rounded-full flex items-center justify-center text-white">
                  <IoIosRemove size={"1.7em"} />
                </p>}
              </div>
            </div>
          );
        })
      ) : (
        <PulseLoader
          style={{ position: 'absolute', bottom: '50%' }}
          color="#0A80FF"
          size="1em"
        />
      )}
    </div>
  );
};

export default Home;
