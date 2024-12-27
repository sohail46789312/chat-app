import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getUsers, usersWithMessage } from '../features/messageSlice'
import { useNavigate } from 'react-router-dom'
import { io } from "socket.io-client"

const Home = () => {
  let { message, users, status, errro } = useSelector((state) => state.message)
  const navigate = useNavigate()

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(usersWithMessage())
  }, [])

  function getTime(createdAt) {
    const now = new Date();
    const timeDifference = now - new Date(createdAt);

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) {
      return 'Now';
    } else if (minutes < 2) {
      return `${minutes} minute ago`;
    } else if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 2) {
      return `${days} days ago`;
    } else {
      const date = new Date(createdAt);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // months are 0-based
      const year = date.getFullYear();
      return `${day}:${month}:${year}`;
    }
  } 

  function handleMessage (recieverId) {
    navigate(`/message/${recieverId}`)
  }

  return (
    <div className='flex flex-col items-center mt-4 gap-4'>
      {status === "succeeded" ? users.map((user, i) => {
        // let formattedTime = getTime(user.latestMessage.createdAt)
        let formattedTime = "hhh"
        return <div key={i} onClick={() => handleMessage(user._id)} className='flex w-80 justify-between items-center'>
          <div className='flex gap-3 items-center'>
            <img className='w-14 h-14 rounded-full' src={user.avatar || "https://res.cloudinary.com/dioj83hyt/image/upload/v1734679232/Chat/if7zp2afhfxbnmk2vrvz.jpg"} alt="" />
            <div>
              <h2 className='font-semibold'>{status === "succeeded" ? user.name : null}</h2>
              {/* <p className='text-sm'>{status === "succeeded" ? user.latestMessage.message : null}</p> */}
              <p className='text-sm'>aaa</p>
            </div>
          </div>
          <div className='flex flex-col items-end   '>
            <p className='text-sm text-[#0A80FF]'>{status === "succeeded" ? formattedTime : null}</p>
            <p className='bg-[#0A80FF] rounded-full w-5 h-5 flex items-center justify-center text-white'>2</p>
          </div>
        </div>
      }) : null}
    </div>
  )
}

export default Home
