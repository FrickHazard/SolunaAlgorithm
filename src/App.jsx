import ReactDOM from "react-dom";
import React from "react"
import createModule from './a.out.js';
// for asset loading in webpack
import './a.out.wasm';

import { initThree } from './initThree';

const settings = {
    locateFile : function(path, prefix) {
        // if it's a mem init file, use a custom dir
        
        if (path.endsWith(".wasm")) return path;

        // otherwise, use the default, the prefix (JS file's dir) + the path
        return prefix + path;
      }
};

createModule(settings).then(function(Module) {
    // this is reached when everything is ready, and you can call methods on Module
    // Module._calculateAllGameStates(4, 12)
    // for (var i = 0; i < 40; i++) {
    //     var ptr = Module._getGameState(i);
    //     console.log(new Uint32Array(Module.HEAP32.buffer, ptr, 4));
    // }
});
// const module = res();
// console.log(module);
// module.onRuntimeInitialized = () => {
//     console.log(module._calculateAllGameStates(4, 12));
// };

const App = () => {
 return  <div style={{ color: 'green', width: '100%', height : '100%' }}/>;
}

const wrapper = document.getElementById("container");
wrapper ? ReactDOM.render(<App />, wrapper) : false;

initThree(document.body);
