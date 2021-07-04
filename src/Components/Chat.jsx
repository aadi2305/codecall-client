import React, { useState, useEffect } from 'react'
import "../styles/chat.css"
import SendIcon from '@material-ui/icons/Send';
import CloseIcon from '@material-ui/icons/Close';

const Chat = (props) => {
    const socket = props.socket
    
    const [inputText, setInputText] = useState(null)
    const onChange = e =>{
        setInputText(e.target.value)
    }
    useEffect(() => {
        console.log(socket);
     
    }, [])

    const msgSent = (e)=>{
        e.preventDefault()
        props.setTexts(prevData=>[... prevData, {
            text : inputText,
            senderId : props.myUserId
        }])
        socket.emit('sent-message', {
            text : inputText,
            senderId : props.myUserId
        })
        setInputText("")
    }
    
    return ( 
        <div id = "main-chat-div">
            <button onClick = {()=>{
                    props.setChatToggle(false)
                }} className="chat-btns-close"><CloseIcon />
            </button>
            <div className="chat">
                    <div className="texts">
                        {props.texts.map(text=>{
                            return(
                                <div className = {text.senderId == props.myUserId ? "sent-text" : "recieved-text"}>
                                    <p className = {text.senderId == props.myUserId ? "sent-text-para" : "recieved-text-para"}>{text.text}</p>
                                </div>
                            )
                        })}
                    </div>
            </div>
            <form onSubmit = {msgSent} id = "input" action="">
                <input autoComplete = "off" value = {inputText} onChange = {onChange} id = "chat-input" type="text" />
                <button type="submit" className = "chat-btns"><SendIcon /></button>
            </form>
        </div>
    );
}
 
export default Chat;