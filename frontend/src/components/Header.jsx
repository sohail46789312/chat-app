import React, { useState } from 'react'
import { CiSettings } from 'react-icons/ci'
import { IoMdContact, IoMdSettings } from 'react-icons/io'
import { MdDarkMode, MdOutlineLightMode } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/authSlice'
import { useNavigate } from 'react-router-dom'
import { PulseLoader } from 'react-spinners'
import {Link} from "react-router-dom"

const Header = () => {
  const navigate = useNavigate()
  const [mode, setMode] = useState(false)
  const [show, setShow] = useState(false)
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

  return (
    <div>
      <nav className="dark:bg-[#1A2236] relative h-16 dark:text-[#C6C8CD] flex justify-between items-center px-4 border-b-[1px] dark:border-white/10 border-black/30">
        <h2 className='text-xl font-bold'>Chat</h2>
        <div className='flex items-center gap-3'>
          <div onClick={handleClick}>{mode ? <MdOutlineLightMode color='#0A80FF' size={"1.5em"} /> : <MdDarkMode color='#0A80FF' size={"1.5em"} />}</div>
          <IoMdSettings color='#0A80FF' size={"1.5em"}/>
          {user ? <IoMdContact onClick={handleProfile} color='#0A80FF' size={"1.5em"}/> : null}
        </div>
        {show ? <div className='flex flex-col gap-1 border-[1px] rounded-md py-2 pl-2 absolute right-5 top-12 bg-[#0A80FF] text-white shadow-md w-24'>
          <Link onClick={() => setShow(false)} to={"/profile"} className=''>Profile</Link>
          <p onClick={handleLogout} className=''>{status === "loading" ? <PulseLoader color='white' size={"0.5em"}/> : "Logout"}</p>
        </div> : null}
      </nav>
    </div>
  )
}

export default Header
