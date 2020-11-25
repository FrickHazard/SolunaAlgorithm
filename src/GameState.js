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

// const expandPartition = (partitionId) => {
//     const expandedPartition = []
//     const partition = Interopt.getPartition(partitionId);
//     for (let i = 0; i < partition.length; ++i) {
//         for (let j = 0; j < partition[i].count; ++j) {
//             expandedPartition.push({ number: partition[i].number, pos: this.boardPositions.state[pieceIndex] });
//             ++pieceIndex;
//         }
//     }
//     return expandedPartition
// }

const getNextGameIndexFromMove = (gameStateObject, aciveGameIndex, top, bottom) => {
    return Interopt.doForwardReconstruction(aciveGameIndex, {
        pieceTop: {
            number: top.number
        },
        pieceBottom: {
            number: bottom.number,
        },
        toPartition: gameStateObject[top.colorIndex].id,
        fromPartition: gameStateObject[bottom.colorIndex].id,
        samePartition: (top.colorIndex === bottom.colorIndex)
    })
}

const getMoves = ({ colorIndex, partitionIndex }, gameIndex, gameStateObject) => {
    const pieceHeight = gameStateObject[colorIndex].partition[partitionIndex].number;
    const keys = Object.keys(gameStateObject)
    const moves = [];
    for (let i = 0; i < keys.length; ++i) {
        const key = Number(keys[i])
        for (let j = 0; j < gameStateObject[key].partition.length; ++j) {
            if (
                (key === colorIndex || gameStateObject[key].partition[j].number === pieceHeight) &&
                !(key === colorIndex && j === partitionIndex)
            ) {
                const nextGameId = getNextGameIndexFromMove(gameStateObject, gameIndex,
                    { colorIndex, number: pieceHeight },
                    { colorIndex: key, number: gameStateObject[key].partition[j].number })

                const mistake = Interopt.getBranchResult(gameIndex).guaranteedWin && Interopt.getBranchResult(nextGameId).guaranteedWin

                moves.push({ colorIndex: key, partitionIndex: j, mistake })
            }
        }
    }
    return moves;
}

const gameState = {
    menu: new Sub('initial-conditions'),
    selectedPieceData: new Sub(),
    activeGameIndex: new Sub(),
    // selector of active gameIndex
    activeGameBranchResult: new Sub(),
    initialGamesIndices: new Sub(),
    gameStateObject: new Sub(),
    botsTurn: new Sub(),
    boardPositions: new Sub(),
    history: new Sub(),
    selectPiece({ colorIndex, partitionIndex }) {
        if (this.selectedPieceData.state !== undefined) {
            const { colorIndex: topColorIndex, partitionIndex: topPartitionIndex } = this.selectedPieceData.state;
            if (topColorIndex === colorIndex && partitionIndex === topPartitionIndex) {
                this.selectedPieceData.trigger(undefined);
            } else {
                const topPieceHeight = this.gameStateObject.state[topColorIndex].partition[topPartitionIndex].number
                const bottomPieceHeight = this.gameStateObject.state[colorIndex].partition[partitionIndex].number
                const bottomPos = this.gameStateObject.state[colorIndex].partition[partitionIndex].pos
                const nextGameIndex = getNextGameIndexFromMove(
                    this.gameStateObject.state,
                    this.activeGameIndex.state,
                    {
                        number: topPieceHeight,
                        colorIndex: topColorIndex
                    },
                    {
                        number: bottomPieceHeight,
                        colorIndex
                    })

                const changeDat = Interopt.doBackwardReconstruction(this.activeGameIndex.state, nextGameIndex)

                const newGameStateObject = { ...this.gameStateObject.state }

                newGameStateObject[topColorIndex].partition[topPartitionIndex].number = topPieceHeight + bottomPieceHeight;
                // remove top onto bottom's position
                newGameStateObject[topColorIndex].partition[topPartitionIndex].pos = bottomPos
                newGameStateObject[topColorIndex].id = changeDat.toPartitionNew
                newGameStateObject[colorIndex].partition.splice(partitionIndex, 1)
                if (changeDat.twoChanges) {
                    newGameStateObject[colorIndex].id = changeDat.fromPartitionNew
                } else if (!changeDat.samePartition) {
                    delete newGameStateObject[colorIndex];
                }

                this.gameStateObject.trigger(newGameStateObject);
                this.selectedPieceData.trigger(undefined);
                this.setActiveGameIndex(nextGameIndex);
                this.botsTurn.trigger(!this.botsTurn.state)
            }
        } else {
            this.selectedPieceData.trigger({
                colorIndex,
                partitionIndex,
                moves: getMoves({ colorIndex, partitionIndex }, this.activeGameIndex.state, this.gameStateObject.state)
            })
        }
    },
    setBoardFromInitialGameIndex(gameIndex) {
        const gameState = Array.from(Interopt.getGameState(gameIndex))

        const gameStateObject = {};
        let pieceIndex = 0;
        for (let i = 0; i < gameState.length; ++i) {
            gameStateObject[i] = { id: gameState[i], partition: [] };
            const partition = Interopt.getPartition(gameState[i]);
            for (let j = 0; j < partition.length; ++j) {
                for (let k = 0; k < partition[j].count; ++k) {
                    gameStateObject[i].partition.push({ number: partition[j].number, pos: this.boardPositions.state[pieceIndex] });
                    ++pieceIndex;
                }
            }
        }

        this.setActiveGameIndex(gameIndex);
        this.gameStateObject.trigger(gameStateObject);
        this.selectedPieceData.trigger(undefined);
    },
    setActiveGameIndex(gameIndex) {
        this.activeGameIndex.trigger(gameIndex);
        if (gameIndex !== undefined) {
            const branchResult = Interopt.getBranchResult(gameIndex)
            if (branchResult.leafCount === 0) {
                this.menu.trigger('game-over')
            }
            this.activeGameBranchResult.trigger(branchResult)
            if (this.history.state) {
                this.history.trigger([...this.history.state, {
                    gameIndex,
                    branchResult,
                    //TODO horrendous lazy deep clone
                    gameStateObject: JSON.parse(JSON.stringify(this.gameStateObject.state)),
                }])
            }
        }
    },
    restart() {
        this.setActiveGameIndex(undefined)
        this.gameStateObject.trigger(undefined);
        this.history.trigger(undefined)
        this.menu.trigger('initial-conditions');
        this.botsTurn.trigger(undefined);
    },
    setInitialGameStateIndices() {
        this.initialGamesIndices.trigger(Interopt.getInitialStates());
    },
    startGame({ playerGoesFirst }) {
        this.menu.trigger('none')
        this.selectedPieceData.trigger(undefined);
        this.botsTurn.trigger(!playerGoesFirst)
        this.history.trigger([{
            gameIndex: this.activeGameIndex.state,
            // horrendous lazy deep clone
            gameStateObject: JSON.parse(JSON.stringify(this.gameStateObject.state)),
            branchResult: { ...this.activeGameBranchResult.state },
        }])
    },
    makeSymmetricMove(newGameIndex) {
        const changeDat = Interopt.doBackwardReconstruction(this.activeGameIndex.state, newGameIndex)

        const newGameStateObject = { ...this.gameStateObject.state }

        const entries = Object.entries(newGameStateObject)

        const entry1 = entries.find(x => changeDat.toPartition === x[1].id)
        const entry2 = changeDat.samePartition
            ? entry1
            : entries.find(x => changeDat.fromPartition === x[1].id && x[0] !== entry1[0])

        const topPartitionIndex = newGameStateObject[entry1[0]].partition.findIndex(x => x.number === changeDat.pieceTop.number)
        newGameStateObject[entry1[0]].id = changeDat.toPartitionNew
        newGameStateObject[entry1[0]].partition[topPartitionIndex] = {
            number: changeDat.pieceBottom.number + changeDat.pieceTop.number,
        }

        const bottomPartitionIndex = newGameStateObject[entry2[0]].partition.findIndex(x => x.number === changeDat.pieceBottom.number)
        // remove top onto bottom's position
        newGameStateObject[entry1[0]].partition[topPartitionIndex].pos = newGameStateObject[entry2[0]].partition[bottomPartitionIndex].pos
        newGameStateObject[entry2[0]].partition.splice(bottomPartitionIndex, 1)

        if (changeDat.twoChanges) {
            newGameStateObject[entry2[0]].id = changeDat.fromPartitionNew
        } else if (!changeDat.samePartition) {
            delete newGameStateObject[entry2[0]];
        }

        this.gameStateObject.trigger(newGameStateObject);
        this.setActiveGameIndex(newGameIndex);
        this.botsTurn.trigger(!this.botsTurn.state)
    },
    setRandomBoardPositions(slotCount) {
        const piecePositions = [];
        const ratio = 50 / 4;
        for (let x = 3; x < ratio - 2; ++x) {
            for (let y = 3; y < ratio - 2; ++y) {
                if ((x + y) % 2 == 0) continue;
                piecePositions.push({ x: (x - (ratio / 2)) * 4 - 1, y: (y - (ratio / 2)) * 4 - 1 });
            }
        }
        piecePositions.sort(() => Math.random() - 0.5);
        piecePositions.length = slotCount;
        this.boardPositions.trigger(piecePositions)
    },
    setGameFromHistory(historyIndex) {
        this.history.state[historyIndex]
    },
};

export default gameState;
