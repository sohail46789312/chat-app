import React, { useEffect, useState } from 'react'
import { CiSettings } from 'react-icons/ci'
import { IoIosSearch, IoMdContact, IoMdSettings } from 'react-icons/io'
import { MdDarkMode, MdOutlineLightMode } from 'react-icons/md'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/authSlice'
import { useNavigate } from 'react-router-dom'
import { PulseLoader } from 'react-spinners'
import { Link } from "react-router-dom"
import { getUsers, usersWithMessage } from '../features/messageSlice'
import { IoCloseOutline } from 'react-icons/io5'

const Header = () => {
  let { message, users, prevUsers, errro } = useSelector((state) => state.message)
  const navigate = useNavigate()
  const [mode, setMode] = useState(localStorage.getItem("theme") === "dark" ? true : (localStorage.getItem("theme") === null ? null : false))
  const [show, setShow] = useState(false)
  const [search, setSearch] = useState(false)
  const { user, status, error } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.body.className = "";
    document.body.classList.add(theme);
  }, [theme]);

  function handleClick() {
    if (mode) {
      localStorage.setItem("theme", "light")
      setTheme("light")
      setMode(false)
    }
    else if (mode == null) {
      localStorage.setItem("theme", "light")
      setTheme("light")
      setMode(false)
    }
    else {
      localStorage.setItem("theme", "dark")
      setTheme("dark")
      setMode(true)
    }
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

  function handleQuery(e) {
    if (e.target.value === "") {
      dispatch(usersWithMessage(prevUsers))
    } else {
      dispatch(getUsers(e.target.value))
    }
  }

  function handleSearch() {
    setSearch(!search)
  }

  return (
    <div>
      <nav className="dark:bg-[#1A2236] relative h-16 dark:text-[#C6C8CD] flex justify-between items-center px-4 border-b-[1px] dark:border-white/10 border-black/30">
        <div className='absolute '>
          <input onChange={handleQuery} className={`${search ? "block" : "hidden"} dark:bg-[#1A2236] bg-white p-3 rounded-md w-80 border-[1px] dark:border-white/10 border-black/30 placeholder-black/60 dark:placeholder-white/60`} type="text" placeholder='Search' />
          <IoCloseOutline onClick={handleSearch} className='absolute cursor-pointer right-3 top-[14px]' color='#0A80FF' size={"1.5em"} />
        </div>
        <h2 onClick={() => navigate("/")} className='text-xl font-bold cursor-pointer'>Chat</h2>
        <div className='flex items-center gap-3'>
          <div className='cursor-pointer select-none' onClick={handleClick}>{mode ? <MdOutlineLightMode color='#0A80FF' size={"1.5em"} /> : (mode === null ? <MdOutlineLightMode color='#0A80FF' size={"1.5em"} />: <MdDarkMode color='#0A80FF' size={"1.5em"} />)}</div>
          {!user ? null : <IoIosSearch className='cursor-pointer select-none' onClick={handleSearch} color='#0A80FF' size={"1.5em"} />}
          {!user ? null : <img onClick={handleProfile} className='w-[1.5em] cursor-pointer rounded-full' src={user.avatar} />}
        </div>
        {show ? <div className='flex flex-col gap-1 border-[1px] rounded-md py-2 pl-2 absolute z-10 right-5 top-12 bg-[#0A80FF] text-white shadow-md w-28'>
          <Link onClick={() => setShow(false)} to={"/newgroup"} className='cursor-pointer'>New Group</Link>
          <Link onClick={() => setShow(false)} to={"/profile"} className='cursor-pointer'>Profile</Link>
          <p onClick={handleLogout} className='cursor-pointer'>{status === "loading" ? <PulseLoader color='white' size={"0.5em"} /> : "Logout"}</p>
        </div> : null}
      </nav>
    </div>
  )
}

export default Header
