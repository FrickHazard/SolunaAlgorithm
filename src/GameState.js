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

// multi set diff
const getGameStateDiff  = (gameState1, gameState2) => {
    const hash1 = {};
    for (const partitionIndex of gameState1) {
        hash1[partitionIndex] = hash1[partitionIndex] ? hash1[partitionIndex] + 1 : 1;
    }
    const hash2 = {};
    for (const partitionIndex of gameState2) {
        hash2[partitionIndex] = hash2[partitionIndex] ? hash2[partitionIndex] + 1 : 1;
    }

    const result = [];
    for (const key of Object.keys(hash2)) {
        if (hash1[key] === undefined) {
            result.push(Number(key));
        }
        else if (hash1[key] < hash2[key]) {
            for (let i = 0; i < (hash2[key] - hash1[key]); ++i) {
                result.push(Number(key));
            }
        }
    }
    result.sort();
    return result;
};

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
            const diff = getGameStateDiff(gameState, nextGameState);
            if (diff.length !== 1) continue;
            const partition = Interopt.getPartition(diff[0]);
            if (comparePartition(updatedPartition, partition)) {
                const changes = {};
                changes[nextGameState.indexOf(diff[0])] = topColorIndex;
                return [nextGameStateIndice, changes];
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

        for (const nextGameStateIndice of nextPossibleGameStateIndices) {
            const nextGameState = Interopt.getGameState(nextGameStateIndice);
            const diff = getGameStateDiff(gameState, nextGameState);

            // handle case when a color is effectively eliminated
            if (diff.length === 1 && (updatedPartitionBottom.length === 0 || updatedPartitionTop.length === 0)) {
                const partition = Interopt.getPartition(diff[0]);
                if (updatedPartitionBottom.length === 0 && comparePartition(updatedPartitionTop, partition)) {
                    const changes = {};
                    changes[nextGameState.indexOf(diff[0])] = topColorIndex;
                    return [nextGameStateIndice, changes];
                } else if (updatedPartitionTop.length === 0 && comparePartition(updatedPartitionBottom, partition)) {
                    const changes = {};
                    changes[nextGameState.indexOf(diff[0])] = bottomColorIndex;
                    return [nextGameStateIndice, changes];
                }
            }

            if (diff.length !== 2) continue;

            const partition1 = Interopt.getPartition(diff[0]);
            const partition2 = Interopt.getPartition(diff[1]);

            if (
                comparePartition(updatedPartitionTop, partition1)
                && comparePartition(updatedPartitionBottom, partition2)               
            ) {
                const changes = {};             
                changes[nextGameState.indexOf(diff[0])] = topColorIndex;
                changes[nextGameState.indexOf(diff[1])] = bottomColorIndex;

                return [nextGameStateIndice, changes];
            } else if (
                comparePartition(updatedPartitionTop, partition2)
                && comparePartition(updatedPartitionBottom, partition1)
            ) {
                const changes = {};
                changes[nextGameState.indexOf(diff[1])] = topColorIndex;
                changes[nextGameState.indexOf(diff[0])] = bottomColorIndex;

                return [nextGameStateIndice, changes];
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
    selectedPieceIndex  : new Sub(),
    activeGameIndex     : new Sub(),
    initialGamesIndices : new Sub(),
    moveUpdate          : new Sub(),
    resetBoardUpdate    : new Sub(),
    colorMap            : new Sub(),
    //gameBoardPosition   : new Sub(),
    // colorMap            : new Sub(),
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
                const res =  getSymmetricChange(this.selectedPieceIndex.state[0], [colorIndex, partitionIndex, subPartitionIndex], this.activeGameIndex.state[0]);

                if (newGameIndex !== undefined) {
                    const [newGameIndex, changes] = res;
                    const updatedColorMap = { ...this.colorMap.state };

                    for (const key of Object.keys(changes)) {
                        updatedColorMap[key] = changes[key];
                    }
                    this.colorMap.trigger(updatedColorMap);
                    this.selectedPieceIndex.trigger(undefined); 
                    this.setActiveGameIndex(newGameIndex);
                    
                    this.moveUpdate.trigger(
                        this.selectedPieceIndex.state[0],
                        [colorIndex, partitionIndex, subPartitionIndex],
                        this.activeGameIndex.state[1],
                        updatedColorMap
                    );
                }
                 
            }
        }
        else this.selectedPieceIndex.trigger([
            [colorIndex, partitionIndex, subPartitionIndex],
            getGetValidMoveToPiecesNoSymmetry([colorIndex, partitionIndex], this.activeGameIndex.state[1])
        ]);
    },
    resetBoard(gameIndex) {
        this.setActiveGameIndex(gameIndex);
        this.resetBoardUpdate.trigger(this.activeGameIndex.state);
    },
    setActiveGameIndex(gameIndex) {
        this.activeGameIndex.trigger([gameIndex, Interopt.getGameStateExpandedToPartitions(gameIndex)]);
    },
    setInitialGameStateIndices() {
        this.initialGamesIndices.trigger(Interopt.getInitialStates());
        this.colorMap.trigger({ 0: 0, 1: 1, 2: 2, 3: 3 });
    }
};

export default gameState;

// initialGameStatesMap={Interopt.isLoaded() ? Interopt.getInitialStates() : []}
// onSelect={(gameIndex) => {
//     const gameStIdx = Interopt.getNextPossibleGameStateIndices(gameIndex)[0];           
//     pieceSystem.setState(4, Array.from(Interopt.getGameStateExpandedToPartitions(gameStIdx)));
// }}