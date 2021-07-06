import React, { useState, useEffect, useRef } from 'react'
import {Link} from 'react-router-dom'
import Chat from "./Chat"
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
import Editor from "./Editor"
import {Switch} from "antd"

const ENDPOINT = "http://localhost:8001/socket.io/";
const MainPage = (match) => {
    const [texts, setTexts] = useState([])
    const [mic, setMic] = useState(true)
    const [cam, setCam] = useState(true)
    const [myUserId, setMyUserId] = useState(null)
    const [otherUserId, setOtherUserId] = useState(null)
    const [myVideoState, setMyVideo] = useState(false)
    const [screenShare, setScreenShare] = useState(false)
    const [chatToggle, setChatToggle] = useState(false)
    const [interviewModeState, setInterviewModeState] = useState(false)
    const [delta, setDelta] = useState(null)
    let socket = React.useRef(null);
    let streamRef = React.useRef(null);
    let otherstreamRef = React.useRef(null);
    let callRef = useRef(null)
    let myPeerRef = useRef(null)


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
    const dragElement2 = ()=>{
        if(interviewModeState == false)return
        const elmnt  = document.getElementById("other-person-video-div")
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
    const dragElement = ()=>{   
        const elmnt  = document.getElementById("my-video-div")
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
        myPeerRef.current = new Peer(undefined, {
            host: '/',
            port: '3002'
        })
        myPeerRef.current.on('open', id => {
            setMyUserId(id)
            const obj = {
                roomId : match.match.params.id,
                userId : id
            }
            socket.current.emit('join-room', obj)
            
        })
        socket.current.on('user-disconnected', userId => {
            console.log("User Disconnected");
            if(callRef.current)callRef.current.close()
        })
        socket.current.on('recieved-msg', msgObj=>{
            console.log(msgObj);
            setTexts(prevData=>[...prevData, msgObj])
        })
        socket.current.on("recieve-changes", newChanges=>{
            setDelta(newChanges);
        })
        socket.current.on("turn-on-editor", yo=>{
            setInterviewModeState(true)
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
                setMyVideo(true)
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
                    setOtherUserId(userId)
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
    useEffect(() => {
        console.log(myUserId, otherUserId);
    }, [myUserId, otherUserId])

    const chatCloseHandler = ()=>{
        if(chatToggle)setChatToggle(!chatToggle)
    }
    const interviewMode = ()=>{
        if(interviewModeState == false)socket.current.emit("toggle-editor", true)
        setInterviewModeState(!interviewModeState)
    }
    const textOnStyle = {
        backgroundColor : "white",
        color : "black"
    }
    const textOffStyle = {
        backgroundColor : "black",
        color : "white"
    }
    return ( 
        <div  className="main-page">
            {chatToggle &&
            <div className="chat-div">
                <Chat texts = {texts} setTexts = {setTexts} socket = {socket.current} myUserId = {myUserId} otherUserId = {otherUserId} setChatToggle = {setChatToggle}  />
            </div>}
            <div onClick = {chatCloseHandler}  id = "my-video-div">
                {myVideoState?<p id = "you">You</p>:null}
                <video onMouseDown = {dragElement} id = "my-video"></video>
            </div>
            <div id =  {interviewModeState ? "other-person-video-div" : "other-person-video-div2"} >
                <video onMouseDown = {dragElement2}  onClick = {chatCloseHandler} id = "other-person-video"></video>
            </div>
                
           
           {interviewModeState && <Editor delta = {delta} socket = {socket.current} />}
            
            
            <div onClick = {chatCloseHandler} className="option-bar">
                <div className = "mui-icons" onClick = {micToggle} >{mic?<MicIcon  style = {normalStyle}/>:<MicOffIcon  style = {redStyle}/>}</div>
                <div className = "mui-icons" onClick = {camToggle} >{cam?<VideocamIcon  style = {normalStyle}/>:<VideocamOffIcon  style = {redStyle}/>}</div>
                <Link to = "/"><div className = "mui-icons"><CallEndIcon style = {redStyle}/></div></Link>
                <div onClick = {()=>setChatToggle(!chatToggle)} className = "mui-icons"><ChatIcon style = {normalStyle} /></div>
                <button onClick={() =>  navigator.clipboard.writeText(match.match.params.id)} id = "copyLink"title = "Copy Meet Link"><div><FileCopyOutlinedIcon title="Copy Meet Link" style = {normalStyle} /></div></button>
                <button className = "btn" id = "text-editor-toggle" onClick = {interviewMode}>Text Editor</button>              
            </div>
    </div>
     );
}
 
export default MainPage;