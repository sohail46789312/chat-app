import React, { useState } from 'react'
import { CiSettings } from 'react-icons/ci'
import { IoIosSearch, IoMdContact, IoMdSettings } from 'react-icons/io'
import { MdDarkMode, MdOutlineLightMode } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/authSlice'
import { useNavigate } from 'react-router-dom'
import { PulseLoader } from 'react-spinners'
import { Link } from "react-router-dom"
import { getUsers } from '../features/messageSlice'
import { IoCloseOutline } from 'react-icons/io5'

const Header = () => {
  const navigate = useNavigate()
  const [mode, setMode] = useState(false)
  const [show, setShow] = useState(false)
  const [search, setSearch] = useState(false)
  const { user, status, error } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  function handleClick() {
    document.body.classList.toggle("dark")
    setMode(!mode)
  }

  function handleProfile() {
    setShow(!show)
  }

  function handleLogout() {
    const fetchUserData = async () => {
      await dispatch(logout())
      setShow(false)
    }
    fetchUserData()
  }

  function handleQuery (e) {
    dispatch(getUsers(e.target.value))
  }

  function handleSearch () {
    setSearch(!search)
  }

  return (
    <div>
      <nav className="dark:bg-[#1A2236] relative h-16 dark:text-[#C6C8CD] flex justify-between items-center px-4 border-b-[1px] dark:border-white/10 border-black/30">
      <div className='absolute '>
        <input onChange={handleQuery} className={`${search ? "block" : "hidden"} bg-white p-3 rounded-md w-80 border-[1px] dark:border-white/10 border-black/30 placeholder-black/60 dark:placeholder-white/60`} type="text" placeholder='Search' />
        <IoCloseOutline onClick={handleSearch} className='absolute right-2 top-[14px]' color='#0A80FF' size={"1.5em"}/>
      </div>
        <h2 className='text-xl font-bold'>Chat</h2>
        <div className='flex items-center gap-3'>
          <div onClick={handleClick}>{mode ? <MdOutlineLightMode color='#0A80FF' size={"1.5em"} /> : <MdDarkMode color='#0A80FF' size={"1.5em"} />}</div>
          <IoIosSearch onClick={handleSearch} color='#0A80FF' size={"1.5em"} />
          {user ? <img onClick={handleProfile} className='w-[1.5em] rounded-full' src={user.avatar} /> : <IoMdContact onClick={handleProfile} color='#0A80FF' size={"1.5em"} />}
        </div>
        {show ? <div className='flex flex-col gap-1 border-[1px] rounded-md py-2 pl-2 absolute right-5 top-12 bg-[#0A80FF] text-white shadow-md w-24'>
          <Link onClick={() => setShow(false)} to={"/profile"} className=''>Profile</Link>
          <p onClick={handleLogout} className=''>{status === "loading" ? <PulseLoader color='white' size={"0.5em"} /> : "Logout"}</p>
        </div> : null}
      </nav>
    </div>
  )
}

export default Header
