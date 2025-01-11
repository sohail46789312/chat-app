import React, { useEffect, useState } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import Signup from './page/Signup'
import Signin from './page/Signin'
import Profile from './page/Profile'
import Home from './page/Home'
import Layout from './layout/Layout'
import { useDispatch, useSelector } from 'react-redux'
import { PulseLoader } from 'react-spinners'
import ChangePassword from './page/ChangePassword'
import ForgotPassword from './page/ForgotPassword'
import ResetPassword from './page/ResetPassword'
import Message from './page/Message'
import { getUser } from './features/authSlice'
import io from "socket.io-client"
import { Toaster } from 'react-hot-toast'

const App = () => {
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)
  const dispatch = useDispatch()

  const { user, status } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchUserData = async () => {
      await dispatch(getUser())
      setLoading(false)
    }
    fetchUserData()
  }, [dispatch])

  useEffect(() => {
    if (user && user._id) {
      const socketConnection = io("http://localhost:3000", {
        query: {
          userId: user._id,
        },
      })
      setSocket(socketConnection)

      // Cleanup the socket connection when component unmounts or user changes
      return () => {
        socketConnection.off("newMessage")
        socketConnection.disconnect()
      }
    }
  }, [user])

  // Display a loading spinner while data is being fetched
  if (loading) {
    return (
      <div className='w-screen h-screen flex justify-center bg-[#1A2236]'>
        <PulseLoader className='absolute top-[50%] -translate-y-1/2' color='#0A80FF' />
      </div>
    )
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <>{user && socket ? <Home socket={socket} /> : <Navigate to="/signin" />}</>
        },
        {
          path: "/signin",
          element: <>{!user ? <Signin /> : <Navigate to="/" />}</>
        },
        {
          path: "/signup",
          element: <>{!user ? <Signup /> : <Navigate to="/" />}</>
        },
        {
          path: "/profile",
          element: <>{user ? <Profile /> : <Navigate to="/signin" />}</>
        },
        {
          path: "/changepassword",
          element: <>{user ? <ChangePassword /> : <Navigate to="/signin" />}</>
        },
        {
          path: "/forgotpassword",
          element: <>{!user ? <ForgotPassword /> : <Navigate to="/" />}</>
        },
        {
          path: "/resetpassword",
          element: <>{!user ? <ResetPassword /> : <Navigate to="/" />}</>
        },
        {
          path: "/message/:recieverId",
          element: <>{user && socket ? <Message socket={socket} /> : <Navigate to="/signin" />}</>
        },
      ]
    }
  ])

  return (
    <div>
      <Toaster />
      <RouterProvider router={router} />
    </div>
  )
}

export default App
