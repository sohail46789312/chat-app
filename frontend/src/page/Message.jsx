import React, { useEffect, useRef, useState } from "react";
import { LiaCheckDoubleSolid } from "react-icons/lia";
import { Navigate, useParams } from "react-router-dom";
import { IoIosAttach, IoIosCall, IoMdSend } from "react-icons/io";
import { MdCall, MdCallEnd, MdEmojiEmotions } from "react-icons/md";
import { useGetMessagesQuery, useSendMessageMutation } from "../app/api";
import { useSelector } from "react-redux";
import { FaPhoneAlt, FaVideo } from "react-icons/fa";
import { useForm } from "react-hook-form";
import Peer from "simple-peer";
import toast from "react-hot-toast";
import { MyLocation, Stream } from "@mui/icons-material";
import { CiMicrophoneOff, CiVideoOff, CiVolumeMute } from "react-icons/ci";

const Message = ({ socket }) => {
    const [text, setText] = useState("");
    const [showAttachmentBox, setShowAttachmentBox] = useState(false);
    const [image, setImage] = useState({});
    const [file, setFile] = useState();
    const [localMessages, setLocalMessages] = useState([]);

    const { recieverId } = useParams();

    const imageRef = useRef();
    const videoRef = useRef();
    const audioRef = useRef();
    const fileRef = useRef();
    const scrollRef = useRef();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm();

    const { data, isLoading, isError, error, refetch } = useGetMessagesQuery(
        recieverId,
        {
            refetchOnMountOrArgChange: true,
        }
    );
    const [sendMessage] = useSendMessageMutation();

    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (data?.messages) {
            setLocalMessages(data?.messages);
        }
    }, [data?.messages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }, [localMessages]);

    useEffect(() => {
        if (!isLoading) {
            setLocalMessages(data.messages);
        }
    }, [isLoading]);

    useEffect(() => {
        if (socket && data?.user) {
            socket.on("newMessage", (newMessage) => {
                if (newMessage.senderId._id === data.user._id) {
                    setLocalMessages((prevMessages) => [...prevMessages, newMessage]);
                }
            });
            socket.on("newGroupMessage", (newMessage) => {
                if (newMessage.recieverId === data.user._id) {
                    setLocalMessages((prevMessages) => [...prevMessages, newMessage]);
                }
                localStorage.setItem([newMessage.recieverId], newMessage.message);
            });

            return () => {
                socket.off("newMessage");
            };
        }
    }, [socket, data?.user]);

    function handleMessage(e) {
        setText(e.target.value);
    }

    async function send() {
        const newMessage = {
            message: text,
            senderId: {
                _id: user._id,
                avatar: user.avatar,
            },
            recieverId,
            file,
        };

        setLocalMessages((prevMessages) => [...prevMessages, newMessage]);

        sendMessage(newMessage);

        setText("");
        localStorage.setItem([newMessage.recieverId], newMessage.message);
        refetch();
    }

    function handleAttachmentBox() {
        setShowAttachmentBox((prev) => !prev);
    }

    function handleImage() {
        imageRef.current.click();
    }

    function handleVideo() {
        videoRef.current.click();
    }

    function handleAudio() {
        audioRef.current.click();
    }

    function handleFile() {
        fileRef.current.click();
    }

    function handleFileInput(e) {
        let file = e.target.files[0];
        let reader = new FileReader();

        if (file?.type?.startsWith("image/")) {
            reader.onload = (event) => {
                setImage((prev) => ({ ...prev, image: event.target.result }));
            };
        } else if (file?.type?.startsWith("video/")) {
            reader.onload = (event) => {
                setImage((prev) => ({ ...prev, video: event.target.result }));
            };
        } else {
            reader.onload = (event) => {
                setImage((prev) => ({ ...prev, audio: event.target.result }));
            };
        }

        reader.readAsDataURL(file);
        setFile(file);

        refetch();
    }

    function handleImageClick(link) {
        window.location.href = link;
    }

    const myVideo = useRef();
    const userVideo = useRef();
    const [video, setVideo] = useState(false)
    const [stopAudio, setStopAudio] = useState(false)

    const [calling, setCalling] = useState(false);
    const [callerName, setCallerName] = useState("");
    const [callerSignal, setCallerSignal] = useState("");
    const [callerSocketId, setCallerSocketId] = useState("");
    const [callAccepted, setCallAccepted] = useState(false);

    const connectionRef = useRef();

    const [me, setMe] = useState("");

    const startStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            if (myVideo.current) {
                myVideo.current.srcObject = stream;
            }

            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream: stream,
            });


            connectionRef.current = peer;

            return { peer, stream }
        } catch (error) { }
    };

    useEffect(() => {
        socket.on("me", (id) => {
            setMe(id);
        });

        socket.on("calling", (data) => {
            setCalling(true);
            setCallAccepted(false);
            setCallerName(data.name);
            setCallerSignal(data.signal);
            setCallerSocketId(data.from);
        });

        socket.on("callrejected", (data) => {
            toast.error(`${data.name} rejected you call.`);
            window.location.reload()
        });

        socket.on("callended", (data) => {
            toast.error(`Call is ended by ${data.name}, refreshing...`)
            window.location.reload()
        })

        return () => {
            socket.off("calling");
            socket.off("callaccepted");
            socket.off("callrejected");
        };
    }, [socket]);

    function callToUser(id) {
        setVideo(true)
        startStream().then(({ peer }) => {
            peer.on("signal", (data) => {
                socket.emit("callToUser", {
                    callToUserId: recieverId, // Use the recieverId from params
                    signalData: data,
                    from: me,
                    name: user.name,
                });
            });

            socket.on("acceptsignal", (data) => {
                setCallAccepted(true);
                setCallerSocketId(data.from);
                peer.signal(data.signal);
            });

            peer.on("stream", (stream) => {
                userVideo.current.srcObject = stream; // Set second user's stream to be visible to the first user
            });

            peer.on("connect", () => {
            })

            peer.on("error", (err) => {
            })
        })
    }

    function rejectCall() {
        setCalling(false);
        setCallAccepted(false);
        socket.emit("rejectcall", { to: callerSocketId, name: user.name });
    }

    function answerCall() {
        setVideo(true)
        startStream().then(({ stream }) => {
            setCallAccepted(true);
            setCalling(false);


            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream: stream,
            });


            peer.on("signal", (data) => {
                socket.emit("callaccepted", {
                    signal: data,
                    to: callerSocketId,
                    from: me,
                });
            });

            peer.on("stream", (stream) => {
                userVideo.current.srcObject = stream;
            });

            peer.on("connect", () => {
            })

            peer.on("error", (err) => {
            })

            if (callerSignal) {
                peer.signal(callerSignal);
            }

            connectionRef.current = peer;
        });
    }

    function endCall() {
        socket.emit("callended", { to: callerSocketId, name: user.name })
        window.location.reload()
    }


    return (
        <>
            {calling && !callAccepted ? (
                <div className="dark:bg-white flex items-center justify-center rounded-md w-[300px] py-2 absolute top-[10%] left-[50%] -translate-x-[50%] z-[11]">
                    <p className="font-bold text-xl text-center">
                        {callerName} is Calling you...
                    </p>
                    <div className="flex justify-center gap-4 bottom-2">
                        <p onClick={rejectCall} className="bg-gray-300 h-8 w-8 rounded-full p-1 text-2xl font-bold text-red-500">
                            <MdCallEnd size={"1em"} />
                        </p>
                        <p
                            onClick={answerCall}
                            className="bg-gray-300 h-8 w-8 rounded-full p-1 text-2xl font-bold text-green-500"
                        >
                            <MdCall size={"1em"} />
                        </p>
                    </div>
                </div>
            ) : null}
            {video ?
                <div
                    style={{ height: "calc(100vh - 64px)" }}
                    className="flex flex-col items-center w-screen px-3 justify-center relative bg-white dark:bg-[#1A2236] z-10"
                >
                    <div className="max-h-[420px] max-w-[640px] relative flex items-center justify-center">
                        <video className="rounded-lg bg-gray-400" muted={stopAudio} autoPlay src="" ref={userVideo}></video>
                        <video
                            className="w-28 h-20 object-cover bg-gray-400 rounded-md absolute right-2 -top-32"
                            muted
                            autoPlay
                            src=""
                            ref={myVideo}
                        ></video>
                    </div>
                    <div className="bg-white select-none absolute p-2 flex gap-4 bottom-2 left-[50%] -translate-x-[50%] rounded-full">
                        <div className={`${stopAudio ? "bg-gray-400" : null} rounded-full p-1`}>
                            <CiVolumeMute onClick={() => setStopAudio(!stopAudio)} size={"2em"} />
                        </div>
                        <IoIosCall onClick={endCall} color="red" size={"2em"} />
                    </div>
                </div> : null
            }
            {!video ?
                <div
                    style={{ minHeight: "calc(100vh - 64px)" }}
                    className="dark:bg-[#1A2236]"
                >
                    <div className="flex flex-col w-80 m-[auto] dark:bg-[#1A2236]">
                        <div className="flex gap-4 justify-between items-center sticky top-0 pt-4 dark:bg-[#1A2236]">
                            <div className="flex gap-2">
                                <img
                                    className="w-8 h-8 rounded-full object-cover"
                                    src={data?.user?.avatar || null}
                                    alt=""
                                />
                                <p className="font-semibold text-xl dark:text-[#C6C8CD]">
                                    {data?.user?.name || null}
                                </p>
                            </div>
                            <div className="flex gap-4 self-end items-center justify-center pb-[12px]">
                                {data?.user?.members ? null : <FaVideo
                                    onClick={() => callToUser(data.user._id)}
                                    className="cursor-pointer"
                                    color="#0A80FF"
                                    size={"1em"}
                                />}
                            </div>
                        </div>
                        <div className="flex flex-col gap-8 mt-8 dark:bg-[#1A2236] pb-20">
                            {!isLoading && user
                                ? localMessages.map((message, i) => (
                                    <div
                                        key={i}
                                        className={`${message.senderId._id === user._id
                                            ? "self-end"
                                            : "self-start"
                                            } flex gap-2`}
                                    >
                                        <img
                                            className="w-8 h-8 rounded-full object-cover"
                                            src={message.senderId.avatar}
                                            alt=""
                                        />
                                        <div>
                                            <img
                                                onClick={() =>
                                                    handleImageClick(message.file?.secure_url)
                                                }
                                                className={`${message?.file?.type?.startsWith("image/") ||
                                                    message?.file?.resource_type === "image"
                                                    ? "block"
                                                    : "hidden"
                                                    } cursor-pointer object-cover mb-2 w-28 h-28 rounded-md`}
                                                src={
                                                    message?.file?.type?.startsWith("image/")
                                                        ? image.image
                                                        : message.file?.secure_url
                                                }
                                                alt=""
                                            />
                                            <video
                                                className={`${message?.file?.type?.startsWith("video/") ||
                                                    message?.file?.resource_type === "video"
                                                    ? "block"
                                                    : "hidden"
                                                    } cursor-pointer mb-2 w-36 h-36 rounded-md`}
                                                controls
                                                src={
                                                    message?.file?.type?.startsWith("video/")
                                                        ? image.video
                                                        : message.file?.secure_url
                                                }
                                            ></video>
                                            <audio
                                                className={`${message?.file?.type?.startsWith("audio/") ||
                                                    message?.file?.resource_type === "audio"
                                                    ? "block"
                                                    : "hidden"
                                                    } cursor-pointer mb-2 w-64 rounded-md`}
                                                controls
                                            >
                                                <source
                                                    src={
                                                        message?.file?.type?.startsWith("audio/")
                                                            ? image.audio
                                                            : message.file?.secure_url
                                                    }
                                                />
                                            </audio>
                                            <div
                                                className={`${message.message.length > 0 ? "flex" : "hidden"
                                                    } flex items-center min-h-8 px-2 bg-[#1A2236] dark:bg-white dark:text-black text-white rounded-md`}
                                            >
                                                <p className="break-words max-w-44">
                                                    {message.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                                : null}
                            <div ref={scrollRef}></div>
                        </div>
                        <div className="fixed bottom-0 pb-4 pt-2 flex w-80 items-center gap-2 dark:bg-[#1A2236] bg-white">
                            <input
                                onChange={handleMessage}
                                value={text}
                                className="bg-transparent dark:text-white p-3 rounded-md w-80 border-[1px] dark:border-white/10 border-black/30 placeholder-black/60 dark:placeholder-white/60"
                                type="text"
                                placeholder="Type a message"
                            />
                            <div className="hidden">
                                <input
                                    accept="image/*"
                                    hidden
                                    {...register("image")}
                                    onChange={(e) => {
                                        handleFileInput(e);
                                        setValue("image", e.target.files[0]);
                                    }}
                                    ref={imageRef}
                                    type="file"
                                />
                                <input
                                    accept="video/*"
                                    hidden
                                    {...register("video")}
                                    onChange={(e) => {
                                        handleFileInput(e);
                                        setValue("video", e.target.files[0]);
                                    }}
                                    ref={videoRef}
                                    type="file"
                                />
                                <input
                                    accept="audio/*"
                                    hidden
                                    {...register("audio")}
                                    onChange={(e) => {
                                        handleFileInput(e);
                                        setValue("audio", e.target.files[0]);
                                    }}
                                    ref={audioRef}
                                    type="file"
                                />
                            </div>
                            <div
                                className={`${showAttachmentBox ? "flex" : "hidden"
                                    } flex-col gap-1 border-[1px] rounded-md py-2 absolute z-10 right-7 bottom-20 bg-[#0A80FF] text-white shadow-md w-28`}
                            >
                                <p
                                    onClick={handleImage}
                                    className="hover:bg-[#0a60bd] pl-2 cursor-pointer"
                                >
                                    Image
                                </p>
                                <p
                                    onClick={handleVideo}
                                    className="hover:bg-[#0a60bd] pl-2 cursor-pointer"
                                >
                                    Video
                                </p>
                                <p
                                    onClick={handleAudio}
                                    className="hover:bg-[#0a60bd] pl-2 cursor-pointer"
                                >
                                    Audio
                                </p>
                            </div>
                            <IoIosAttach
                                onClick={handleAttachmentBox}
                                className="select-none cursor-pointer"
                                color="#0A80FF"
                                size={"1.5em"}
                            />
                            <IoMdSend
                                className="cursor-pointer"
                                onClick={send}
                                color="#0A80FF"
                                size={"1.5em"}
                            />
                        </div>
                    </div>
                </div> : null
            }
        </>
    );
};

export default Message;
