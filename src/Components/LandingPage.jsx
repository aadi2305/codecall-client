import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router';
import {Link} from "react-router-dom"
import {v4} from "uuid";
import "../styles/landingpage.css"

const LandingPage = () => {
    const history = useHistory();
    const [value, setValue] = useState("")
    const routeChange = () =>{ 
      let path =  v4();
      history.push(path);
    }
    useEffect(() => {
        
        console.log(value);
    }, [value])
    const changeHandler = (e)=>{
        setValue(e.target.value)
    }
    const style = {
        display : "flex",
        alignItems : "center"
    }
    return ( 
        <div className="landing-page">
            <div className="row">
                <div className="col col-6" id = "lading-page-header-div">
                    <p id = "lading-page-header">Coding Interviews Made Simple</p>
                    <div style = {{display:"flex"}}>
                        <button onClick = {routeChange} className="btn start-meet">Start A Meeting</button>
                        <form style = {style}>
                            <input autocomplete = "off"  onChange = {changeHandler} type="text" placeholder = "Enter The Code" id ="enter-code"/>
                            {value != "" ?<Link to = {"/"+value}><button style = {{marginLeft : "5px"}} className = "btn start-meet">Join</button></Link>:null}
                        </form>
                    </div>
                </div>
                <div className="col col-6" id = "coding-img-div">
                    <img src="./interview.png" id = "coding-img" />
                </div>
            </div>
        </div>  
     );
}
 
export default LandingPage;