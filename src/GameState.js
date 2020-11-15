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
    }, [])
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
    const result = {};
    for (const key of Object.keys(gameStateObject)) {
        result[key] = Interopt.getPartition(gameStateObject[key])
    }
    return result;
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
    menu: new Sub('initial-conditions'),
    selectedPieceIndex: new Sub(),
    activeGameIndex: new Sub(),
    initialGamesIndices: new Sub(),
    moveUpdate: new Sub(),
    resetBoardUpdate: new Sub(),
    gameStateObject: new Sub(),
    botsTurn: new Sub(),
    setSelectedPiece([colorIndex, height, pieceUuid]) {
        if (this.selectedPieceIndex.state[0] !== undefined) {
            const [currentColorIndex, currentHeight, currentPieceUuid] = this.selectedPieceIndex.state[0];
            if (pieceUuid === currentPieceUuid) {
                this.selectedPieceIndex.trigger([undefined, undefined]);
            } else {
                const newGameStateObject = { ...this.gameStateObject.state }

                const nextGameIndex = Interopt.doForwardReconstruction(this.activeGameIndex.state[0], {
                    pieceTop: {
                        number: currentHeight
                    },
                    pieceBottom: {
                        number: height,
                    },
                    toPartition: this.gameStateObject.state[currentColorIndex],
                    fromPartition: this.gameStateObject.state[colorIndex],
                    samePartition: (currentColorIndex === colorIndex)
                })

                const changeDat = Interopt.doBackwardReconstruction(this.activeGameIndex.state[0], nextGameIndex)

                newGameStateObject[currentColorIndex] = changeDat.toPartitionNew
                if (changeDat.twoChanges) {
                    newGameStateObject[colorIndex] = changeDat.fromPartitionNew
                } else if (!changeDat.samePartition) {
                    delete newGameStateObject[colorIndex]
                }

                this.gameStateObject.trigger(newGameStateObject);
                this.selectedPieceIndex.trigger([undefined, undefined]);
                this.moveUpdate.trigger([
                    currentPieceUuid,
                    pieceUuid,
                    expandPartitons(newGameStateObject),
                ]);
                this.setActiveGameIndex(nextGameIndex);
                this.botsTurn.trigger(!this.botsTurn.state)
            }
        }
        else this.selectedPieceIndex.trigger([
            [colorIndex, height, pieceUuid],
            getGetValidMoveToPiecesNoSymmetry([colorIndex, height], this.activeGameIndex.state[1])
        ]);
    },
    resetBoard(gameIndex) {
        const gameState = Array.from(Interopt.getGameState(gameIndex))

        const gameStateObject = {};
        for (let i = 0; i < gameState.length; ++i)
            gameStateObject[i] = gameState[i]

        this.setActiveGameIndex(gameIndex);
        this.gameStateObject.trigger(gameStateObject);
        this.resetBoardUpdate.trigger(expandPartitons(gameStateObject));
    },
    setActiveGameIndex(gameIndex) {
        this.activeGameIndex.trigger([gameIndex, Interopt.getGameStateExpandedToPartitions(gameIndex), Interopt.getBranchResult(gameIndex)]);
    },
    setInitialGameStateIndices() {
        this.initialGamesIndices.trigger(Interopt.getInitialStates());
    },
    menuSetState(st) {
        this.menu.trigger(st);
    },
    startGame({ playerGoesFirst }) {
        this.menu.trigger('none')
        this.selectedPieceIndex.trigger([undefined, undefined]);
        this.botsTurn.trigger(!playerGoesFirst)
    },
    makeSymmetricMove(newGameIndex) {
        const changeDat = Interopt.doBackwardReconstruction(this.activeGameIndex.state[0], newGameIndex)

        const newGameStateObject = { ...this.gameStateObject.state }

        const entries = Object.entries(newGameStateObject)

        const entry1 = entries.find(x => changeDat.toPartition === x[1])
        const entry2 = changeDat.samePartition
            ? null
            : entries.find(x => changeDat.fromPartition === x[1] && x[0] !== entry1[0])

        const topId = {
            topColorIndex: Number(entry1[0]),
            height: changeDat.pieceTop.number
        };
        const bottomId = {
            bottomColorIndex: (changeDat.samePartition
                ? topId.topColorIndex
                : Number(entry2[0])),
            height: changeDat.pieceBottom.number
        };

        newGameStateObject[entry1[0]] = changeDat.toPartitionNew
        if (changeDat.twoChanges) newGameStateObject[entry2[0]] = changeDat.fromPartitionNew
        else if (!changeDat.samePartition) {
            delete newGameStateObject[entry2[0]]
        }

        this.gameStateObject.trigger(newGameStateObject);
        this.moveUpdate.trigger([
            topId,
            bottomId,
            expandPartitons(newGameStateObject),
        ]);
        this.setActiveGameIndex(newGameIndex);
        this.botsTurn.trigger(!this.botsTurn.state)
    },
};

export default gameState;
