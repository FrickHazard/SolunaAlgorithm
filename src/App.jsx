import ReactDOM from "react-dom";
import React from "react"
import "./interopt.js"
import { initThree } from './initThree';

const App = () => {
 return  <div style={{ color: 'green', width: '100%', height : '100%' }}/>;
}

const wrapper = document.getElementById("container");
wrapper ? ReactDOM.render(<App />, wrapper) : false;

initThree(document.body);
