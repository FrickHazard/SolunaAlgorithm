import ReactDOM from "react-dom";
import React from "react"
import createModule from './a.out.js';

// import resModule from './res.wasm';

// const module = res({
//     locateFile(path) {
//       if(path.endsWith('.wasm')) {
//         return resModule;
//       }
//       return path;
//     }
// });

createModule(/* optional default settings */).then(function(Module) {
    // this is reached when everything is ready, and you can call methods on Module
    Module._calculateAllGameStates(4, 12)
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
