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
import IconButton from '@material-ui/core/IconButton';
import Peer from "peerjs"
import io from "socket.io-client"
import axios from "../axios"

const ENDPOINT = "http://localhost:8001/socket.io/";
const MainPage = (match) => {
    const [mic, setMic] = useState(true)
    const [cam, setCam] = useState(true)
    const [userId, setUserId] = useState(null)
    let socket = React.useRef(null);
    let streamRef = React.useRef(null);
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
        socket.current = io.connect("/");
        const myPeer = new Peer(undefined, {
            host: '/',
            port: '3002'
        })
        myPeerRef.current = myPeer;
        const myVideo = document.getElementById("my-video");

        myVideo.muted = true

        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
            }).then(stream => {
            streamRef.current = stream;
            addVideoStream(myVideo, stream)
            if(myPeer){
            myPeer.on('call', call => {
                callRef.current = call
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

        myPeer.on('open', id => {
            const obj = {
                roomId : match.match.params.id,
                userId : id
            }
            socket.current.emit('join-room', obj)
            
        })
        function connectToNewUser(userId, stream) {
            const call = myPeer.call(userId, stream)
            const video = document.getElementById('other-person-video')
            call.on('stream', userVideoStream => {
              addVideoStream(video, userVideoStream)
            })
            call.on('close', () => {
              video.remove()
            })
           
        }
    return () => socket.current.disconnect()   
    }, [])

    const shareTheScreen = ()=>{
        navigator.mediaDevices.getDisplayMedia({ cursor: true }).then(stream => {
            const myVideo = document.getElementById("my-video2");
            // callRef.current.answer(stream)
            const screenTrack = stream.getTracks()[0];
            addVideoStream(myVideo, stream)
            // // senders.current.find(sender => sender.track.kind === 'video').replaceTrack(screenTrack);
            // screenTrack.onended = function() {
            //     // senders.current.find(sender => sender.track.kind === "video").replaceTrack(userStream.current.getTracks()[1]);
            //     callRef.current.answer(streamRef.current)
            // }
        })
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
                <div className = "mui-icons"><CallEndIcon style = {redStyle}/></div>
                <div className = "mui-icons" onClick = {shareTheScreen} ><ScreenShareIcon style = {normalStyle} /></div>
                <div className = "mui-icons"><ChatIcon style = {normalStyle} /></div>
                <div class="dropup">
                    <div className = "mui-icons" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <MoreVertIcon style = {normalStyle} />
                    </div>
                    <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <p className="dropdown-item" href="#">Copy Meet Link</p>
                    </div>
                </div>
            </div>
        </div>
     );
}
 
export default MainPage;