import React, { useEffect, useRef, useState } from 'react'
import { IoIosCall } from 'react-icons/io';
import Peer from "simple-peer"

const Video = ({ socket }) => {
    const myVideo = useRef();
    const userVideo = useRef();
    const [stream, setStream] = useState();

    const [calling, setCalling] = useState(false)
    const [callerName, setCallerName] = useState("")
    const [callerSignal, setCallerSignal] = useState("")
    const [callerSocketId, setCallerSocketId] = useState("")
    const [callAccepted, setCallAccepted] = useState(false)

    const connectionRef = useRef();

    const [me, setMe] = useState("");

    useEffect(() => {
        const getMediaStream = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(mediaStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error accessing media devices.", err);
            }
        };

        getMediaStream();

    }, [socket]);

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
            toast.error(`${data.name} rejected you call.`)
        })

        return () => {
            socket.off("calling");
            socket.off("callaccepted");
            socket.off("callrejected");
        };
    }, [socket]);


    const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream,
    });

    peer.on("signal", (data) => {
        socket.emit("callToUser", {
            callToUserId: recieverId, // Use the recieverId from params
            signalData: data,
            from: me,
            name: user.name,
        });
    });

    socket.on("callaccepted", (data) => {
        setCallAccepted(true);
        setCallerSocketId(data.from);
        peer.signal(data.signal);
    });

    peer.on("stream", (stream) => {
        userVideo.current.srcObject = stream;
    });

    connectionRef.current = peer;

    function rejectCall() {
        setCalling(false)
        setCallAccepted(false)
        socket.emit("rejectcall", { to: callerSocketId, name: user.name })
    }

    function answerCall() {
        startStream().then(() => {
            setCallAccepted(true)
            setCalling(false)
            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream: stream
            });

            peer.on("signal", (data) => {
                socket.emit("callaccepted", { signal: data, to: callerSocketId, from: me })
            })

            peer.on("stream", (stream) => {
                userVideo.current.srcObject = stream
            })

            if (!callerSignal) {
                return
            }
            peer.signal(callerSignal)

            connectionRef.current = peer
        })
    }

    return (
        <div>
            {calling && !callAccepted ? <div className="dark:bg-white rounded-md w-[350px] h-[200px] absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-[11]">
                <p className="font-bold text-xl text-center pt-4">{callerName} is Calling you.</p>
                <div className="flex justify-center gap-4 w-full px-4 absolute bottom-2">
                    <p onClick={rejectCall} className="text-2xl font-bold text-red-500">Reject</p>
                    <p onClick={answerCall} className="text-2xl font-bold text-green-500">Accept</p>
                </div>
            </div> : null}
            <div
                style={{ height: "calc(100vh - 64px)" }}
                className="flex flex-col justify-center absolute bg-white dark:bg-[#1A2236] z-10"
            >
                <video
                    className=""
                    muted
                    autoPlay
                    src=""
                    ref={userVideo}
                ></video>
                <video className="w-40 bg-black rounded-md absolute right-2 top-2" muted autoPlay src="" ref={myVideo}></video>
                <div className="bg-white absolute p-3 flex  bottom-2 w-[300px] left-[50%] -translate-x-[50%] rounded-md">
                    <IoIosCall color="red" size={"2em"} />
                </div>
            </div>
        </div>
    )
}

export default Video
