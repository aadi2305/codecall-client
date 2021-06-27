import React, { useState, useEffect } from 'react'; 
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import LandingPage from "./Components/LandingPage"
import Nav from "./Components/Nav"
import MainPage from "./Components/MainPage"
import "./styles/app.css"
function App() {
  return (
    <Router>
      <div className="app">
        <Route path = "/" exact component = {Nav}/>
        <Switch>
          <Route path = "/" exact component = {LandingPage}/>
          <Route path = "/:id" component = {MainPage}/>
        </Switch>
      </div>
    </Router>

  );
}

export default App;
