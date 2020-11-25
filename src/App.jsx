import ReactDOM from "react-dom";
import React from "react"
import Interopt from "./interopt"
import { MainPage } from './components/MainPage.jsx';
import { initThree } from './initThree';
import GameState from './GameState';
import Bot from './BotSysyem';

initThree(document.body);

Interopt.onLoad(() => {
    const pieceCount = 12
    Interopt.init(4, pieceCount)
    GameState.setRandomBoardPositions(pieceCount)
    GameState.setInitialGameStateIndices();
    Bot.init()
});

const App = () => {
    return <MainPage />
}

const wrapper = document.getElementById("container");
wrapper ? ReactDOM.render(<App />, wrapper) : false;
