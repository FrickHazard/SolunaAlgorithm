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



const expandPartitons = (gameStateObject) => {
    const result = { };
    for (const key of Object.keys(gameStateObject)) {
        result[key] = Interopt.getPartition(gameStateObject[key])
    }
    return result;
}

const updateGameStateObject = (gameStateObject, topIndex, bottomIndex, changes) => {
    if (changes[gameStateObject[topIndex]] !== undefined) {
        gameStateObject[topIndex] = changes[gameStateObject[topIndex]]
    }
    else { gameStateObject[topIndex] = undefined; console.error()}

    if (topIndex !== bottomIndex && changes[gameStateObject[bottomIndex]] !== undefined) {
        gameStateObject[bottomIndex] = changes[gameStateObject[bottomIndex]]
    } else if (topIndex !== bottomIndex) gameStateObject[bottomIndex] = undefined;

    return gameStateObject
}

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
        if (par1[i].number !== par2[i].number || par1[i].count !== par2[i].count) return false;
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
                newPartition.push({ number: toAdd[i], count: 1 });
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
const getSymmetricChange = (topPiece, bottomPiece, sameIndex, gameStateIndex) => {
    const [topPartitionId, topHeight] = topPiece;
    const [bottomPartitionId, bottomHeight] = bottomPiece;

    const gameState = Interopt.getGameState(gameStateIndex);
    const topColorIndex = gameState.indexOf(topPartitionId)
    const bottomColorIndex = (topPartitionId === bottomPartitionId)
        ? sameIndex
            ? topColorIndex
            : gameState.indexOf(bottomPartitionId, topColorIndex + 1)
        : gameState.indexOf(bottomPartitionId)


    const nextPossibleGameStateIndices = Interopt.getNextPossibleGameStateIndices(gameStateIndex);

    if (topColorIndex === bottomColorIndex) {

        const updatedPartition = applyMoveToPartiton(
            [topHeight, bottomHeight],
            [topHeight + bottomHeight],
            Interopt.getPartition(gameState[topColorIndex]));

        for (const nextGameStateIndice of nextPossibleGameStateIndices) {
            const nextGameState = Interopt.getGameState(nextGameStateIndice);
            const diff = getGameStateDiff(gameState, nextGameState);
            if (diff.length !== 1) continue;
            const partition = Interopt.getPartition(diff[0]);
            if (comparePartition(updatedPartition, partition)) {
                const changes = {};
                changes[gameState[topColorIndex]] = diff[0];
                return [nextGameStateIndice, changes];
            }
        }
    }

    else {
        const updatedPartitionTop = applyMoveToPartiton(
            [topHeight],
            [topHeight + bottomHeight],
            Interopt.getPartition(gameState[topColorIndex])
        );

        const updatedPartitionBottom = applyMoveToPartiton(
            [bottomHeight],
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
                    changes[gameState[topColorIndex]] = diff[0];
                    return [nextGameStateIndice, changes];
                } else if (updatedPartitionTop.length === 0 && comparePartition(updatedPartitionBottom, partition)) {
                    const changes = {};
                    changes[nextGameState[bottomColorIndex]] = diff[0];
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
                changes[gameState[topColorIndex]] = diff[0];
                changes[gameState[bottomColorIndex]] = diff[1];

                return [nextGameStateIndice, changes];
            } else if (
                comparePartition(updatedPartitionTop, partition2)
                && comparePartition(updatedPartitionBottom, partition1)
            ) {
                const changes = {};
                changes[gameState[topColorIndex]] = diff[1];
                changes[gameState[bottomColorIndex]] = diff[0];

                return [nextGameStateIndice, changes];
            }
        }
    }
}

const getGetValidMoveToPiecesNoSymmetry = ([colorIndex, height], expandedGameState) => {
    const result = [];
    for (let i = 0; i < expandedGameState.length; ++i) {
        for (let j = 0; j < expandedGameState[i].length; ++j) {
            if (i === colorIndex || expandedGameState[i][j].number === height) {
                result.push({ colorIndex: i, height: expandedGameState[i][j].number });
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
    gameStateObject     : new Sub(),
    setSelectedPiece([colorIndex, height, pieceUuid]) {
        if (this.selectedPieceIndex.state[0] !== undefined) {
            const [currentColorIndex, currentHeight, currentPieceUuid] = this.selectedPieceIndex.state[0];
            if (pieceUuid === currentPieceUuid) {
                this.selectedPieceIndex.trigger([undefined, undefined]);
            } else {
                const res =  getSymmetricChange(
                    [this.gameStateObject.state[currentColorIndex], currentHeight, currentPieceUuid],
                    [this.gameStateObject.state[colorIndex], height, pieceUuid],
                    (currentColorIndex === colorIndex),
                    this.activeGameIndex.state[0]);
                if (res !== undefined) {
                    const [newGameIndex, changes] = res;

                    const newGameStateObject = updateGameStateObject(
                        { ...this.gameStateObject.state },
                        currentColorIndex,
                        colorIndex,
                        changes);

                    this.gameStateObject.trigger(newGameStateObject);
                    this.moveUpdate.trigger([
                        currentPieceUuid,
                        pieceUuid,
                        expandPartitons(newGameStateObject),
                    ]);
                    this.setActiveGameIndex(newGameIndex);
                    this.selectedPieceIndex.trigger([undefined, undefined]);
                }
                else {
                    console.error('Symmetric changes failed')
                    return;
                }
            }
        }
        else this.selectedPieceIndex.trigger([
            [colorIndex, height, pieceUuid],
            getGetValidMoveToPiecesNoSymmetry([colorIndex, height], this.activeGameIndex.state[1])
        ]);
    },
    resetBoard(gameIndex) {
        const gameState = Array.from(Interopt.getGameState(gameIndex))

        const gameStateObject = { };
        for (let i = 0; i  < gameState.length; ++i)
            gameStateObject[i] = gameState[i]

        this.setActiveGameIndex(gameIndex);
        this.gameStateObject.trigger(gameStateObject)
        this.resetBoardUpdate.trigger(expandPartitons(gameStateObject));
        this.selectedPieceIndex.trigger([undefined, undefined]);
    },
    setActiveGameIndex(gameIndex) {
        this.activeGameIndex.trigger([gameIndex, Interopt.getGameStateExpandedToPartitions(gameIndex)]);
    },
    setInitialGameStateIndices() {
        this.initialGamesIndices.trigger(Interopt.getInitialStates());
    }
};

export default gameState;
