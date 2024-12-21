import React, { useEffect, useState } from 'react'
import { createBrowserRouter, Navigate, RouterProvider, useNavigate } from 'react-router-dom'
import Signup from './page/Signup'
import Signin from './page/Signin'
import Profile from './page/Profile'
import Home from './page/Home'
import Layout from './layout/Layout'
import { useDispatch, useSelector } from 'react-redux'
import { getUser } from './features/authSlice'
import { PulseLoader } from 'react-spinners'

const App = () => {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  let { user, status } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchUserData = async () => {
      await dispatch(getUser())
      setLoading(false)
    }
    fetchUserData()
  }, [dispatch])

  if (loading) {
    return <div className='w-screen h-screen flex justify-center bg-[#1A2236]'>
      <PulseLoader className='absolute top-[50%] -translate-y-1/2' color='#0A80FF' />
    </div>
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <>{user ? <Home /> : <Navigate to="/signin" />}</>
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
          element: <>{user ? <Profile /> : <Navigate to="/profile" />}</>
        }
      ]
    }
  ])
  return (
    <RouterProvider router={router} />
  )
}

export default App
