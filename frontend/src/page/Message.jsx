import React, { useEffect, useRef, useState } from 'react'
import { LiaCheckDoubleSolid } from 'react-icons/lia'
import { useParams } from 'react-router-dom'
import { IoIosAttach, IoMdSend } from 'react-icons/io'
import { MdEmojiEmotions } from 'react-icons/md'
import { useGetMessagesQuery, useSendMessageMutation } from '../app/api'
import { useSelector } from 'react-redux'
import { FaPhoneAlt, FaVideo } from 'react-icons/fa'

const Message = ({ socket }) => {
    const [text, setText] = useState("")
    const { recieverId } = useParams();
    const { user } = useSelector((state) => state.auth)

    const { data, isLoading, isError, error } = useGetMessagesQuery(recieverId, {
        refetchOnMountOrArgChange: true
    })

    useEffect(() => {
        if(data?.messages){
            setLocalMessages(data?.messages)
        }
    }, [data?.messages])

    const [sendMessage] = useSendMessageMutation();

    const scrollRef = useRef()

    const [localMessages, setLocalMessages] = useState([])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [localMessages])

    useEffect(() => {
        if (!isLoading) {
            setLocalMessages(data.messages)
        }
    }, [isLoading])

    function handleMessage(e) {
        setText(e.target.value)
    }

    async function send() {
        const newMessage = {
            message: text,
            senderId: {
                _id: user._id,
                avatar: user.avatar
            },
            recieverId
        };
        
        setLocalMessages((prevMessages) => [...prevMessages, newMessage]);

        sendMessage(newMessage);

        setText('');
        localStorage.setItem([newMessage.recieverId], newMessage.message)
    }

    useEffect(() => {
        if (socket && data?.user) {
            socket.on("newMessage", (newMessage) => {
                if (newMessage.senderId._id === data.user._id) {
                    setLocalMessages((prevMessages) => [...prevMessages, newMessage]);
                }
            });
            socket.on("newGroupMessage", (newMessage) => {
                console.log(111)
                if (data?.user?.members?.includes(newMessage.senderId._id)) {
                    console.log("aaa")
                    setLocalMessages((prevMessages) => [...prevMessages, newMessage]);
                }
                localStorage.setItem([newMessage.recieverId], newMessage.message)
            });

            return () => {
                socket.off("newMessage");
            }
        }
    }, [socket, data?.user]);

    console.log(localMessages)

    return (
        <div style={{minHeight: "calc(100vh - 64px)"}} className='dark:bg-[#1A2236]'>
            <div className='flex flex-col w-80 m-[auto] dark:bg-[#1A2236]'>
                <div className='flex gap-4 justify-between items-center sticky top-0 pt-4 dark:bg-[#1A2236]'>
                    <div className='flex gap-2'>
                        <img className='w-8 h-8 rounded-full' src={data?.user?.avatar || null} alt="" />
                        <p className='font-semibold text-xl dark:text-[#C6C8CD]'>{data?.user?.name || null}</p>
                    </div>
                    <div className='flex gap-4 self-end items-center justify-center pb-[12px]'>
                        <FaPhoneAlt className='cursor-pointer' color='#0A80FF' size={"1em"} />
                        <FaVideo className='cursor-pointer' color='#0A80FF' size={"1em"} />
                    </div>
                </div>
                <div className='flex flex-col gap-8 mt-8 dark:bg-[#1A2236] pb-20'>
                    {!isLoading && user ? localMessages.map((message, i) => (
                        <div key={i} className={`${message.senderId._id === user._id ? "self-end" : "self-start"} flex gap-2`}>
                            <img className='w-8 h-8 rounded-full' src={message.recieverId === recieverId ? message.senderId.avatar : user.avatar} alt="" />
                            <div className='flex items-center px-2 gap-2 bg-[#1A2236] dark:bg-white dark:text-black text-white rounded-md'>
                                <p>{message.message}</p>
                                <LiaCheckDoubleSolid color='#0A80FF' size={"1em"} />
                            </div>
                        </div>
                    )) : null}
                    <div ref={scrollRef}></div>
                </div>
                <div className='fixed bottom-0 pb-4 pt-2 flex w-80 items-center gap-2 dark:bg-[#1A2236] bg-white'>
                    <MdEmojiEmotions className='cursor-pointer' color='#0A80FF' size={"1.5em"} />
                    <input
                        onChange={handleMessage}
                        value={text}
                        className='bg-transparent dark:text-white p-3 rounded-md w-80 border-[1px] dark:border-white/10 border-black/30 placeholder-black/60 dark:placeholder-white/60'
                        type="text"
                        placeholder="Type a message"
                    />
                    <IoIosAttach className='cursor-pointer' color='#0A80FF' size={"1.5em"} />
                    <IoMdSend className='cursor-pointer' onClick={send} color='#0A80FF' size={"1.5em"} />
                </div>
            </div>
        </div>
    )
}

export default Message
