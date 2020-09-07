import React from 'react';
import Interopt from "./interopt"

export const useStateEffect = (...unsubscribeCallbacks) => {
    return React.useEffect(() => {
        // cleanup
        return () => {
            for (const unsubscribe of unsubscribeCallbacks) {
                unsubscribe();
            }
        };
    })
};

class Sub {
    constructor(initialState) { 
        this.set = new Set();
        this.state = initialState;
    }

    trigger(state) {
        this.state = state;    
        for (const callback of this.set) {
            callback(state);
        }
    }

    subscribe(callback) {
        this.set.add(callback);
        return () => {
            this.set.delete(callback);
        };
    }
}

const comparePartition = (par1, par2) => {
    if (par1.length != par2.length) return false;
    for (let i = 0; i < par1.length; ++i) {
        if (par1[i].number !== par2[i].number || par1[2] !== par2[2]) return false;
    }
    return true;
};

const applyMoveToPartiton = (toRemove, toAdd, partition) => {

    const didRemove = toRemove.map(x => false);
    const didAdd = toAdd.map(x => false);

    const newPartition = [];
    
    partition.map(x =>({ ...x })).forEach(partitionNumb => {

        for (let i = 0; i < toRemove.length; ++i) {
            const removee = toRemove[i];
            if (!didRemove[i] && partitionNumb.number === removee) {
                --partitionNumb.count;
                didRemove[i] = true;
            }
        }

        for (let i = 0; i < toAdd.length; ++i) {
            if (!didAdd[i] && partitionNumb.number > toAdd[i]) {
                newPartition.push({ number: newHeightNumb, count: 1 });
                didAdd[i] = true;
            } else if (!didAdd[i] && partitionNumb.number === toAdd[i]) {
                ++partitionNumb.count;
                didAdd[i] = true;
            }
        }

        if (partitionNumb.count !== 0) {
            newPartition.push(partitionNumb);
        }
    });

    for (let i = 0; i < toAdd.length; ++i) {
        if (!didAdd[i])
            newPartition.push({ number: toAdd[i], count: 1 });
    }

   return newPartition;
};

// reconstruct to find which symmetric state we are in
const getSymmetricChange = (topPiece, bottomPiece, gameStateIndex) => {
    const [topColorIndex, topPartitionIndex, topSubPartitionIndex] = topPiece;
    const [bottomColorIndex, bottomPartitionIndex, bottomSubPartitionIndex] = bottomPiece;

    const expandedGameState = Interopt.getGameStateExpandedToPartitions(gameStateIndex);
    const gameState = Interopt.getGameState(gameStateIndex);
    const nextPossibleGameStateIndices = Interopt.getNextPossibleGameStateIndices(gameStateIndex);

    if (topColorIndex === bottomColorIndex) {

        const updatedPartition = applyMoveToPartiton(
            [expandedGameState[topColorIndex][topPartitionIndex].number, expandedGameState[bottomColorIndex][bottomPartitionIndex].number],
            [expandedGameState[topColorIndex][topPartitionIndex].number + expandedGameState[bottomColorIndex][bottomPartitionIndex].number],
            Interopt.getPartition(gameState[topColorIndex])
        );

        for (const nextGameStateIndice of nextPossibleGameStateIndices) {
            const nextGameState = Interopt.getGameState(nextGameStateIndice);
            const diff = nextGameState.filter(function(x) { return gameState.indexOf(x) < 0 });
            if (diff.length !== 1) continue;
            const partition = Interopt.getPartition(diff[0]);
            if (comparePartition(updatedPartition, partition)) {
                return nextGameState;
            }
        }
    }

    else {
        const updatedPartitionTop = applyMoveToPartiton(
            [expandedGameState[topColorIndex][topPartitionIndex].number],
            [expandedGameState[topColorIndex][topPartitionIndex].number + expandedGameState[bottomColorIndex][bottomPartitionIndex].number],
            Interopt.getPartition(gameState[topColorIndex])
        );

        const updatedPartitionBottom = applyMoveToPartiton(
            [expandedGameState[bottomColorIndex][bottomPartitionIndex].number],
            [],
            Interopt.getPartition(gameState[bottomColorIndex])
        );

        console.log(updatedPartitionBottom, updatedPartitionTop);

        for (const nextGameStateIndice of nextPossibleGameStateIndices) {
            const nextGameState = Interopt.getGameState(nextGameStateIndice);
            const diff = nextGameState.filter(function(x) { return gameState.indexOf(x) < 0 });

            // handle case when a color is effectively eliminated
            if (diff.length === 1 && (updatedPartitionBottom.length === 0 || updatedPartitionTop.length === 0)) {
                const partition = Interopt.getPartition(diff[0]);
                if (updatedPartitionBottom.length === 0 && comparePartition(updatedPartitionTop, partition)) {
                    return nextGameState;
                } else if (updatedPartitionTop.length === 0 && comparePartition(updatedPartitionBottom, partition)) {
                    return nextGameState;
                }
            }

            if (diff.length !== 2) continue;

            const partition1 = Interopt.getPartition(diff[0]);
            const partition2 = Interopt.getPartition(diff[1]);
            if (
                (comparePartition(updatedPartitionTop, partition1)
                && comparePartition(updatedPartitionBottom, partition2))
                || (comparePartition(updatedPartitionTop, partition2)
                && comparePartition(updatedPartitionBottom, partition1))
            ) {
                return nextGameState;
            }
        }
    }
}


const getGetValidMoveToPiecesNoSymmetry = ([colorIndex, partitionIndex], expandedGameState) => {
    const result = [];
    for (let i =0; i < expandedGameState.length; ++i) {
        for (let j =0; j < expandedGameState[i].length; ++j) {
            if (colorIndex === i && partitionIndex === j && expandedGameState[i][j].count === 1) continue;
            if (i === colorIndex || expandedGameState[i][j].number === expandedGameState[colorIndex][partitionIndex].number) {
                result.push([i, j]);
            }
        }
    }
    return result;
}

const gameState = {
    selectedPieceIndex   : new Sub(),
    activeGameIndex      : new Sub(),
    initialGamesIndices  : new Sub(),
    setSelectedPieceIndex([colorIndex, partitionIndex, subPartitionIndex]) {
        if (this.selectedPieceIndex.state !== undefined) {
            const [currentColorIndex, currentPartitionIndex, currentSubPartitionIndex] = this.selectedPieceIndex.state[0];
            if (
                colorIndex === currentColorIndex
                && partitionIndex === currentPartitionIndex
                && subPartitionIndex === currentSubPartitionIndex
            ) {
                this.selectedPieceIndex.trigger(undefined);
            } else {     
                // // reconnect to symmetry          
                // const nextPossibleGameStates = Interopt.getNextPossibleGameStateIndices(this.activeGameIndex.state[0]);
                // const topPartitionNumb  = this.activeGameIndex.state[1][currentColorIndex][currentPartitionIndex];
                // const bottomPartitionNumb  = this.activeGameIndex.state[1][colorIndex][partitionIndex];
                // const currentGameState = Array.from(Interopt.getGameState(this.activeGameIndex.state[0]));

                // for (const gameIndex of nextPossibleGameStates) {
                //     const nextGameState = Array.from(Interopt.getGameState(gameIndex));
                //     const diff = nextGameState.filter(function(x) { return currentGameState.indexOf(x) < 0 });
                    
                //     // for ()

                // }
                // if (nextPossibleGameStates.length > 0) { 
                //     this.setActiveGameIndex(nextPossibleGameStates[0]);
                // }
                // //
                // this.selectedPieceIndex.trigger(undefined);  
                console.log(getSymmetricChange(this.selectedPieceIndex.state[0], [colorIndex, partitionIndex, subPartitionIndex], this.activeGameIndex.state[0]));
            }
        }
        else this.selectedPieceIndex.trigger([
            [colorIndex, partitionIndex, subPartitionIndex],
            getGetValidMoveToPiecesNoSymmetry( [colorIndex, partitionIndex], this.activeGameIndex.state[1])
        ]);
    },
    setActiveGameIndex(gameIndex){
        this.activeGameIndex.trigger([gameIndex, Interopt.getGameStateExpandedToPartitions(gameIndex)])
    },
    setInitialGameStateIndices() {
        this.initialGamesIndices.trigger(Interopt.getInitialStates());
    }
};

export default gameState;

// initialGameStatesMap={Interopt.isLoaded() ? Interopt.getInitialStates() : []}
// onSelect={(gameIndex) => {
//     const gameStIdx = Interopt.getNextPossibleGameStateIndices(gameIndex)[0];           
//     pieceSystem.setState(4, Array.from(Interopt.getGameStateExpandedToPartitions(gameStIdx)));
// }}