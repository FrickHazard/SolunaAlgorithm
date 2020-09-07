import ReactDOM from "react-dom";
import React from "react"
import Interopt from "./interopt"
import { MainPage } from './components/MainPage.jsx';
import { initThree } from './initThree';
import GameState from './GameState';

initThree(document.body);

Interopt.onLoad(() => {
    GameState.setInitialGameStateIndices();
});

const App = () => {
    return  <MainPage/>
}

const wrapper = document.getElementById("container");
wrapper ? ReactDOM.render(<App />, wrapper) : false;
