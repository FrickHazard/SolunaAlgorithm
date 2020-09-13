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
    init (colorCount, pieceCount) {
        Module._calculateAllGameStates(colorCount, pieceCount);
        this.COLOR_COUNT = colorCount;
        this.PIECE_CONT = pieceCount;
    },
    
    onLoad(callback) {
       const self = this;
        _callback = () => { callback() };
    },

    getInitialStates() {
        const count = Module._getInitialStatesCount();
        const ptr = Module._getInitialStates();
        const initialGameStates = new Uint32Array(Module.HEAP32.buffer, ptr, count);

        const result = [];
        for (const gameIndex of initialGameStates) {            
            result.push([gameIndex, this.getGameStateExpandedToPartitions(gameIndex)]);          
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

        return branchResult;
    },

    getGameStateExpandedToPartitions(gameIndex){
        const result = [];
        const gameState = this.getGameState(gameIndex);
        for (const partitionId of gameState) {                
            result.push(this.getPartition(partitionId));
        }
        return result;
    },

    getGameState(gameIndex) {
        const gamePtr = Module._getGameState(gameIndex);
        const gameCount = Module._getGameStateCount(gameIndex);
        const gameState = new Uint32Array(Module.HEAP32.buffer, gamePtr, gameCount);
        return gameState;
    },

    getNextPossibleGameStateIndices(gameIndex) {
        // wasm ptr = 4 bytes
        const result = [];
        const gameStatesPtr = Module._getBoardNextPossibleMoves(gameIndex);
        const gameStatesCount = Module._getBoardNextPossibleMovesCount(gameIndex);
        for  (let i = 0; i < gameStatesCount; ++i) {
            const gameStateIndex = new Uint32Array(Module.HEAP32.buffer, gameStatesPtr + (i * 4) , 1)[0];           
            result.push(gameStateIndex);
        }
        return result;
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