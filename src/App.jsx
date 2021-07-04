import React from 'react'; 
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import LandingPage from "./Components/LandingPage"
import Nav from "./Components/Nav"
import MainPage from "./Components/MainPage"
import Editor from './Components/Editor';
// import Trail from "./Components/"
import "./styles/app.css"
function App() {
  return (
    <Router>
      <div className="app">
        <Route path = "/" exact component = {Nav}/>
        <Switch>
          <Route path = "/" exact component = {LandingPage}/>
          <Route path = "/:id" component = {MainPage}/>
          {/* <Route path = "/:id" component = {Editor}/> */}
          {/* <Route path = "/trail" component = {Trail}/> */}
        </Switch>
      </div>
    </Router>

  );
}

export default App;
