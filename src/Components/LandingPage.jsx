import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router';
import {v4} from "uuid";
import "../styles/landingpage.css"

const LandingPage = () => {
    const history = useHistory();

    const routeChange = () =>{ 
      let path =  v4();
      history.push(path);
    }
    return ( 
        <div className="landing-page">
            <div className="row">
                <div className="col col-6" id = "lading-page-header-div">
                    <p id = "lading-page-header">Coding Interviews Made Simple</p>
                    <div>
                        <button onClick = {routeChange} className="btn start-meet">Start A Meeting</button>
                        <input type="text" placeholder = "Enter The Code" id ="enter-code"/>
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