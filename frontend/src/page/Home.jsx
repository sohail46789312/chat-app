import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usersWithMessage } from '../features/messageSlice';
import { useNavigate } from 'react-router-dom';
import { PulseLoader } from 'react-spinners';
import { useUsersWithMessagesQuery } from '../app/api';

const Home = ({ socket }) => {
  const { users, status } = useSelector((state) => state.message);
  const [formattedTimes, setFormattedTimes] = useState({});
  const [uusers, setUsers] = useState([]);
  const [count, setCount] = useState(() => {
    const storedCount = localStorage.getItem("count");
    return storedCount ? JSON.parse(storedCount) : {};
  });
  const [newMsg, setNewMsg] = useState(null);

  const { data, isError, isLoading, refetch } = useUsersWithMessagesQuery();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isLoading && !isError) {
      refetch();
    }
  }, [refetch, isLoading, isError]);

  useEffect(() => {
    if (data) {
      dispatch(usersWithMessage(data));
      setUsers(data);
    }
  }, [data, dispatch]);

  useEffect(() => {
    setUsers(users);
  }, [users]);

  function getTime(createdAt) {
    const now = new Date();
    const timeDifference = now - new Date(createdAt);

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Now';
    if (minutes < 2) return `${minutes} minute ago`;
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return 'Yesterday';
    if (days < 2) return `${days} days ago`;

    const date = new Date(createdAt);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}:${month}:${year}`;
  }

  function handleMessage(recieverId) {
    setCount((prev) => {
      const updatedCount = { ...prev }; 
      delete updatedCount[recieverId]; 
  
      localStorage.setItem("count", JSON.stringify(updatedCount));
  
      return updatedCount; 
    });
    navigate(`/message/${recieverId}`);
  }

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (newMessage) => {
          setCount((prev) => {
            const currentCount = prev[newMessage.senderId] || 0;
            const updatedCount = {
              ...prev,
              [newMessage.senderId]: currentCount + 1,
            };
  
            localStorage.setItem("count", JSON.stringify(updatedCount));
  
            return updatedCount;
          });
        setNewMsg(newMessage);

        if (!isLoading && !isError) {
          refetch();
        }
      });
      socket.on('newGroupMessage', (newMessage) => {
          setCount((prev) => {
            const currentCount = prev[newMessage.recieverId] || 0;
            const updatedCount = {
              ...prev,
              [newMessage.recieverId]: currentCount + 1,
            };
  
            localStorage.setItem("count", JSON.stringify(updatedCount));
  
            return updatedCount;
          });
          localStorage.setItem([newMessage.recieverId], newMessage.message)
          if (!isLoading && !isError) {
            refetch();
          }
      });

      return () => {
        socket.off('newMessage');
      };
    }
  }, [socket, refetch]);

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTimes = {};
      uusers.forEach((user) => {
        const timeSource = newMsg && newMsg.senderId === user._id
          ? newMsg.createdAt
          : user?.latestMessage?.createdAt;
        updatedTimes[user._id] = getTime(timeSource);
      });
      setFormattedTimes(updatedTimes);
    }, 60000);

    return () => clearInterval(interval);
  }, [uusers, newMsg]);


  return (
    <div
      className="dark:bg-[#1A2236] dark:text-white flex flex-col items-center pt-4 gap-4"
      style={{ minHeight: 'calc(100vh - 64px)' }}
    >
      {!isLoading && Array.isArray(uusers) && uusers[0] !== null ? (
        uusers.map((user, i) => {
          const timeSource = newMsg && newMsg.senderId === user._id
            ? newMsg.createdAt
            : user?.latestMessage?.createdAt;
          const formattedTime = formattedTimes[user._id] || getTime(timeSource);
          return (
            <div
              key={i}
              onClick={() => handleMessage(user._id)}
              className="cursor-pointer flex w-80 justify-between items-center"
            >
              <div className="flex gap-3 items-center">
                <img
                  className="w-14 h-14 rounded-full object-cover"
                  src={
                    user?.avatar ||
                    'https://res.cloudinary.com/dioj83hyt/image/upload/v1734679232/Chat/if7zp2afhfxbnmk2vrvz.jpg'
                  }
                  alt=""
                />
                <div>
                  <h2 className="font-semibold">
                    {status === 'succeeded' ? user?.name : null}
                  </h2>
                  <p className="text-sm">
                    {newMsg && newMsg.senderId === user._id
                      ? (newMsg.message)
                      : (localStorage.getItem(user._id) ? localStorage.getItem(user._id) : user?.latestMessage?.message)}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 flex-col items-end">
                <p className="text-sm text-[#0A80FF]">
                  {status === 'succeeded' && formattedTime !== 'NaN:NaN:NaN'
                    ? formattedTime
                    : null}
                </p>
                {count[user._id] ? (
                  <p className="bg-[#0A80FF] text-xs rounded-full w-4 h-4 flex items-center justify-center text-white">
                    {count[user._id]}
                  </p>
                ) : null}
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
