import React, { useState, useEffect, useRef } from 'react'
import "../styles/mainpage.css"
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import CallEndIcon from '@material-ui/icons/CallEnd';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import CancelPresentationIcon from '@material-ui/icons/CancelPresentation';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ChatIcon from '@material-ui/icons/Chat';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import IconButton from '@material-ui/core/IconButton';
import Peer from "peerjs"
import io from "socket.io-client"
import axios from "../axios"

const ENDPOINT = "http://localhost:8001/socket.io/";
const MainPage = (match) => {
    const [mic, setMic] = useState(true)
    const [cam, setCam] = useState(true)
    const [userId, setUserId] = useState(null)
    const [peers, setPeers] = useState({})
    const [screenShare, setScreenShare] = useState(false)
    let socket = React.useRef(null);
    let streamRef = React.useRef(null);
    let otherstreamRef = React.useRef(null);
    let callRef = useRef(null)
    let myPeerRef = useRef(null)
    let senders = React.useRef([])

    const normalStyle = {
        color: "white",
        fontSize : "43px",
        padding : "10px",
        backgroundColor : "black",
        borderRadius : "100%"
    }
    const redStyle = {
        color: "white",
        fontSize : "43px",
        padding : "10px",
        backgroundColor : "red",
        borderRadius : "100%"
    }
    const dragElement = ()=>{   
        const elmnt  = document.getElementById("my-video-div")
        // const elmnt2 = doc
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        elmnt.onmousedown = dragMouseDown;
        function dragMouseDown(e) {
          e = e || window.event;
          e.preventDefault();
          pos3 = e.clientX;
          pos4 = e.clientY;
          document.onmouseup = closeDragElement;
          document.onmousemove = elementDrag;
        }
        function elementDrag(e) {
          e = e || window.event;
          e.preventDefault();
          pos1 = pos3 - e.clientX;
          pos2 = pos4 - e.clientY;
          pos3 = e.clientX;
          pos4 = e.clientY;
          if(elmnt.offsetTop >=0 && elmnt.offsetLeft >= 0){
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
          }
          else if(elmnt.offsetTop < 0)elmnt.style.top = 0+ "px";
          else if(elmnt.offsetLeft < 0)elmnt.style.left = 0+"px";
        }
        function closeDragElement() {
          document.onmouseup = null;
          document.onmousemove = null;
        }
        
    }

    function addVideoStream(video, stream) {
        video.srcObject = stream
        video.addEventListener('loadedmetadata', () => {
          video.play()
        })
    }
    const micToggle = ()=>{
        streamRef.current.getAudioTracks()[0].enabled = !mic
        setMic(!mic);
    }
    const camToggle = ()=>{
        streamRef.current.getVideoTracks()[0].enabled = !cam
        setCam(!cam);
    }
    useEffect(() => {
        socket.current = io("/");
        myPeerRef.current = new Peer(undefined, {
            host: '/',
            port: '3002'
        })
        myPeerRef.current.on('open', id => {
            const obj = {
                roomId : match.match.params.id,
                userId : id
            }
            socket.current.emit('join-room', obj)
            
        })
        socket.current.on('user-disconnected', userId => {
            console.log("User Disconnected");
            // const call = myPeerRef.current.call(userId, otherstreamRef.current)
            if(callRef.current)callRef.current.close()
        })
        return () => socket.current.disconnect() 
    }, [])
    useEffect(() => {

        const myVideo = document.getElementById("my-video");
        myVideo.muted = true
      
        if(!screenShare){
            navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
                }).then(stream => {
                streamRef.current = stream;
                addVideoStream(myVideo, stream)
                if(myPeerRef.current){
                myPeerRef.current.on('call', call => {
                    call.answer(stream)
                    const video = document.getElementById('other-person-video')
                    call.on('stream', userVideoStream => {
                      addVideoStream(video, userVideoStream)
                    })
                })}
                socket.current.on('user-connected', userId => {
                    setTimeout(() => {
                        connectToNewUser(userId, stream)
                    }, 1000)
                })
                
                
            })
        }
        else{
            navigator.mediaDevices.getDisplayMedia({cursor:true}).then(stream=>{
                addVideoStream(myVideo, stream)
                if(myPeerRef.current){
                    myPeerRef.current.on('call', call => {
                    call.answer(stream)
                    const video = document.getElementById('other-person-video')
                    call.on('stream', userVideoStream => {
                      addVideoStream(video, userVideoStream)
                    })
                })}
                socket.current.on('user-connected', userId => {
                    setTimeout(() => {
                        connectToNewUser(userId, stream)
                    }, 1000)
                })
            })
        }

   
        
    }, [screenShare])
    function connectToNewUser(userId, stream) {
        otherstreamRef.current = stream
        const call = myPeerRef.current.call(userId, stream)
        callRef.current = call
        const video = document.getElementById('other-person-video')
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
        call.on('close', () => {
          video.remove()
        })
       
    }
    const shareTheScreen = ()=>{
        // navigator.mediaDevices.getDisplayMedia({ cursor: true }).then(stream => {
        //     const myVideo = document.getElementById("my-video2");
        //     // callRef.current.answer(stream)
        //     const screenTrack = stream.getTracks()[0];
        //     addVideoStream(myVideo, stream)
        //     // // senders.current.find(sender => sender.track.kind === 'video').replaceTrack(screenTrack);
        //     // screenTrack.onended = function() {
        //     //     // senders.current.find(sender => sender.track.kind === "video").replaceTrack(userStream.current.getTracks()[1]);
        //     //     callRef.current.answer(streamRef.current)
        //     // }
        // })
        setScreenShare(!screenShare)
    }

    const callEndHandler = ()=>{
        // console.log("yo");
        socket.current.disconnect()
    }
    return ( 
        <div className="main-page">
       
      
            <video id = "other-person-video"></video>
            <div  id = "my-video-div">
                <p id = "you">You</p>
                <video onMouseDown = {dragElement} id = "my-video"></video>
            </div>
            
            <div className="option-bar ">
               
                <div className = "mui-icons" onClick = {micToggle} >{mic?<MicIcon  style = {normalStyle}/>:<MicOffIcon  style = {redStyle}/>}</div>
                <div className = "mui-icons" onClick = {camToggle} >{cam?<VideocamIcon  style = {normalStyle}/>:<VideocamOffIcon  style = {redStyle}/>}</div>
                <div className = "mui-icons" onClick = {callEndHandler}><CallEndIcon style = {redStyle}/></div>
                {/* <div className = "mui-icons" onClick = {shareTheScreen} ><ScreenShareIcon style = {normalStyle} /></div> */}
                <div className = "mui-icons"><ChatIcon style = {normalStyle} /></div>
                <button onClick={() =>  navigator.clipboard.writeText(match.match.params.id)} id = "copyLink"title = "Copy Meet Link"><div><FileCopyOutlinedIcon title="Copy Meet Link" style = {normalStyle} /></div></button>

            </div>
        </div>
     );
}
 
export default MainPage;