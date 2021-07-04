import React , {useState, useEffect, useCallback} from 'react'
import "quill/dist/quill.snow.css"
import "../styles/editor.css"
import Quill from "quill"

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
  ]
//recieve-changes
export default function Editor(props) {
    const [quill, setQuill] = useState()

    useEffect(() => {
        if(quill == null)return
        const handler = (delta,oldDelta, source)=>{
            if(source != 'user')return
            props.socket.emit("send-changes", delta)
        }
        quill.on("text-change", handler)

        return ()=>{
            quill.off("text-change", handler)
        }
  
    }, [quill])

    useEffect(() => {
        if(quill == null)return
        const handler = (delta)=>{
            quill.updateContents(delta)
        }
        props.socket.on("recieve-changes", handler)

        return ()=>{
            props.socket.off("recieve-changes", handler)
        }
  
    }, [quill])
    const wrapperRef = useCallback((wrapper) => {
        if(wrapper == null)return
        wrapper.innerHTML = ''
        const editor = document.createElement('div')
        wrapper.append(editor)
        const q = new Quill(editor, {theme : "snow", modules : {toolbar : TOOLBAR_OPTIONS}})
        setQuill(q);
    }, [])
    return (
        <div ref = {wrapperRef} className = "container">
            
        </div>
    )
}
