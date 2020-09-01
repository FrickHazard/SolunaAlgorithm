import ReactDOM from "react-dom";
import React from "react"
import Interopt from "./interopt"
import { MainPage } from './components/MainPage.jsx';
import { initThree } from './initThree';

const pieceSystem = initThree(document.body);

const App = () => {
    const [state, setState] = React.useState({});

    Interopt.onLoad(() => setState({}));

    return  <MainPage
        initialGames={Interopt.isLoaded() ? Interopt.getInitialState() : []}
        onSelect={(gameState) => {console.log("dd"); pieceSystem.setState(4, gameState);}}
    />
}

const wrapper = document.getElementById("container");
wrapper ? ReactDOM.render(<App />, wrapper) : false;
