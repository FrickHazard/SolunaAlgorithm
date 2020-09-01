import createModule from './a.out.js';
import './a.out.wasm';

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
    Module._calculateAllGameStates(4, 12)
    // for (var i = 0; i < 40; i++) {
    //     var ptr = Module._getGameState(i);
    //     console.log(new Uint32Array(Module.HEAP32.buffer, ptr, 4));
    // }
    const count = Module._getInitialStatesCount();
    console.log(count);
    const ptr = Module._getInitialStates();
    const initialGameStates = new Uint32Array(Module.HEAP32.buffer, ptr, count);
    console.log(initialGameStates);
});

export default {aa:null}