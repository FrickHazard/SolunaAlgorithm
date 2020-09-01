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

let _callback = undefined;
let Module = undefined;

createModule(settings).then(function(module) {
    Module = module;
    if (_callback) _callback();
});


const interopt =   {
    isLoaded () { return !(Module === undefined);},
    init () { return   Module._calculateAllGameStates(4, 12); },
    onLoad(callback) {
       const self = this;
        _callback = () => { self.init(); callback() };
    },

    getInitialState() {
        const count = Module._getInitialStatesCount();
        const ptr = Module._getInitialStates();
        const initialGameStates = new Uint32Array(Module.HEAP32.buffer, ptr, count);

        const result = [];
        for (const gameIndex of initialGameStates) {
            const gameState = this.getGameState(gameIndex);
            result.push([]);
            for (const partitionId of gameState) {                
                result[result.length - 1].push(this.getPartition(partitionId));
            }
        }

        return result;
    },

    getBranchResult(gameIndex) {
        const branchPtr = Module._getBoardBranchResult(gameIndex);
            
        const branchResult = {
            leafCount : new Uint32Array(Module.HEAP32.buffer, branchPtr, 1)[0],
            leafVictory: new Uint32Array(Module.HEAP32.buffer, branchPtr + 4, 1)[0],
            guaranteedWin: !!(new Uint8Array(Module.HEAP8.buffer, branchPtr+ 4 + 4, 1)[0])
        };      
    },

    getGameState(gameIndex) {
        const gamePtr = Module._getGameState(gameIndex);
        const gameCount = Module._getGameStateCount(gameIndex);
        const gameState = new Uint32Array(Module.HEAP32.buffer, gamePtr, gameCount);
        return gameState;
    },

    getPartition(partitionId) {
        const partitionPtr = Module._getPartition(partitionId);
        const partitionCount = Module._getPartitionCount(partitionId);

        // struct is number + count;
        const partition = new Uint32Array(Module.HEAP32.buffer, partitionPtr, partitionCount * 2);
        const result =[];
        let prev = undefined;
        for (const partitonStructElement of partition) {
            if (!prev) {
                prev = partitonStructElement;
            } else {
                result.push({number: prev, count: partitonStructElement});
                prev = undefined;
            }
        }
        return result;
    }
}

export default interopt;