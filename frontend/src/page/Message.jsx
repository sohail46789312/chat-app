import React, { useEffect, useRef, useState } from 'react'
import { FaPhone, FaPhoneAlt, FaVideo } from 'react-icons/fa'
import { LiaCheckDoubleSolid } from 'react-icons/lia'
import { useDispatch, useSelector } from 'react-redux'
import { getMessages, sendMessage } from '../features/messageSlice'
import { useParams } from 'react-router-dom'
import { IoIosAttach, IoMdSend } from 'react-icons/io'
import { MdEmojiEmotions } from 'react-icons/md'

const Message = ({ socket }) => {
    const [text, setText] = useState("")
    const { status, users, u, messages, error } = useSelector((state) => state.message)
    const { user } = useSelector((state) => state.auth)

    const scrollRef = useRef()

    const dispatch = useDispatch()
    const { recieverId } = useParams();

    const [localMessages, setLocalMessages] = useState(messages || [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [localMessages])

    useEffect(() => {
        dispatch(getMessages(recieverId))
    }, [recieverId, dispatch])

    useEffect(() => {
        if (status === "succeeded") {
            setLocalMessages(messages)
        }
    }, [status, messages])

    function handleMessage(e) {
        setText(e.target.value)
    }

    async function send() {
        let data = {
            message: text,
            recieverId
        }
        await dispatch(sendMessage(data));
        setLocalMessages([...localMessages, data]);
    }

    useEffect(() => {
        if (socket && u) {
            socket.on("newMessage", (newMessage) => {
                console.log(newMessage.senderId)
                console.log(u._id)
                if (newMessage.senderId === u._id) {
                    console.log(2323232323)
                    setLocalMessages((prevMessages) => [...prevMessages, newMessage]);
                }
            });

            return () => {
                socket.off("newMessage");
            }
        }
    }, [socket, u]); 

    return (
        <div className='dark:bg-[#1A2236] min-h-screen'>
            <div className='flex flex-col w-80 m-[auto] pt-4 dark:bg-[#1A2236]'>
                <div className='flex gap-4 justify-between items-center'>
                    <div className='flex gap-2'>
                        <img className='w-8 h-8 rounded-full' src={status === "succeeded" ? u?.avatar : null} alt="" />
                        <p className='font-semibold text-xl dark:text-[#C6C8CD]'>{status === "succeeded" ? u?.name : null}</p>
                    </div>
                    <div className='flex gap-4 self-end items-center justify-center pb-[12px]'>
                        <FaPhoneAlt color='#0A80FF' size={"1em"} />
                        <FaVideo color='#0A80FF' size={"1em"} />
                    </div>
                </div>
                <div className='flex flex-col gap-8 mt-8 dark:bg-[#1A2236] pb-20'>
                    {status === "succeeded" ? localMessages.map((message, i) => (
                        <div key={i} className={`${message.recieverId === recieverId ? "self-end" : "self-start"} flex gap-2`}>
                            <img className='w-8 h-8 rounded-full' src={message.recieverId === recieverId ? u.avatar : user.avatar} alt="" />
                            <div className='flex items-center px-2 gap-2 bg-[#1A2236] dark:bg-white dark:text-black text-white rounded-md'>
                                <p>{message.message}</p>
                                <LiaCheckDoubleSolid color='#0A80FF' size={"1em"} />
                            </div>
                        </div>
                    )) : null}
                    <div ref={scrollRef}></div>
                </div>
                <div className='fixed bottom-4 flex w-80 items-center gap-2 dark:bg-[#1A2236] bg-white'>
                    <MdEmojiEmotions color='#0A80FF' size={"1.5em"} />
                    <input
                        onChange={handleMessage}
                        value={text}
                        className='bg-transparent p-3 rounded-md w-80 border-[1px] dark:border-white/10 border-black/30 placeholder-black/60 dark:placeholder-white/60'
                        type="text"
                        placeholder={user.name}
                    />
                    <IoIosAttach color='#0A80FF' size={"1.5em"} />
                    <IoMdSend onClick={send} color='#0A80FF' size={"1.5em"} />
                </div>
            </div>
        </div>
    )
}

export default Message
