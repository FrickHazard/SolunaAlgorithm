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
    showInstructions: new Sub(),
    menu: new Sub('main-menu'),
    selectedPieceData: new Sub(),
    activeGameIndex: new Sub(),
    // tied to active gameIndex
    activeGameBranchResult: new Sub(),
    initialGamesIndices: new Sub(),
    gameStateObject: new Sub(),
    botsTurn: new Sub(),
    boardPositions: new Sub(),
    history: new Sub(),
    historyIndex: new Sub(),
    playMode: new Sub(),
    gameOverResult: new Sub(),
    selectPiece({ colorIndex, partitionIndex }) {
        if (this.selectedPieceData.state !== undefined) {
            const { colorIndex: topColorIndex, partitionIndex: topPartitionIndex } = this.selectedPieceData.state;
            if (topColorIndex === colorIndex && partitionIndex === topPartitionIndex) {
                this.selectedPieceData.trigger(undefined);
            } else {
                const topPiece = this.gameStateObject.state[topColorIndex].partition[topPartitionIndex]
                const bottomPiece = this.gameStateObject.state[colorIndex].partition[partitionIndex]
                const nextGameIndex = getNextGameIndexFromMove(
                    this.gameStateObject.state,
                    this.activeGameIndex.state,
                    {
                        number: topPiece.number,
                        colorIndex: topColorIndex
                    },
                    {
                        number: bottomPiece.number,
                        colorIndex
                    })

                const moveLog = {
                    top: { ...topPiece, colorIndex: topColorIndex },
                    bottom: { ...bottomPiece, colorIndex: colorIndex },
                }

                const newGameStateObject = { ...this.gameStateObject.state }

                newGameStateObject[topColorIndex].partition[topPartitionIndex].number = topPiece.number + bottomPiece.number;
                // remove top onto bottom's position
                newGameStateObject[topColorIndex].partition[topPartitionIndex].pos = bottomPiece.pos
                newGameStateObject[colorIndex].partition.splice(partitionIndex, 1)
                newGameStateObject[topColorIndex].id = Interopt.getPartitionId(newGameStateObject[topColorIndex].partition)
                if (topColorIndex !== colorIndex && newGameStateObject[colorIndex].partition.length > 0) {
                    newGameStateObject[colorIndex].id = Interopt.getPartitionId(newGameStateObject[colorIndex].partition)
                } else if (topColorIndex !== colorIndex) {
                    delete newGameStateObject[colorIndex];
                }

                this.applyMove(nextGameIndex, newGameStateObject, moveLog)
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
    applyMove(nextGameIndex, newGameStateObject, moveLog) {
        this.gameStateObject.trigger(newGameStateObject);
        this.setActiveGameIndex(nextGameIndex);
        this.history.trigger([...this.history.state, {
            gameIndex: nextGameIndex,
            branchResult: Interopt.getBranchResult(nextGameIndex),
            moveLog,
            botsTurn: this.botsTurn.state,
            //TODO horrendous lazy deep clone
            gameStateObject: JSON.parse(JSON.stringify(newGameStateObject)),
        }])
        if (this.activeGameBranchResult.state.leafCount === 0) {
            // assumes bot never makes mistake
            const mistakeTurnIndex = this.history.state.findIndex((item, i) =>
                i !== this.history.state.length - 1
                && item.branchResult.guaranteedWin
                && this.history.state[i + 1].branchResult.guaranteedWin)

            this.gameOverResult.trigger({
                mistakeTurnIndex,
                botWon: this.botsTurn.state
            })
        }
        this.selectedPieceData.trigger(undefined);
        this.botsTurn.trigger(!this.botsTurn.state)
    },
    setActiveGameIndex(gameIndex) {
        this.activeGameIndex.trigger(gameIndex);
        if (gameIndex !== undefined) {
            const branchResult = Interopt.getBranchResult(gameIndex)
            this.activeGameBranchResult.trigger(branchResult)
        }
    },
    restart() {
        this.setActiveGameIndex(undefined)
        this.gameStateObject.trigger(undefined);
        this.historyIndex.trigger(undefined)
        this.history.trigger(undefined)
        this.gameOverResult.trigger(undefined)
        this.menu.trigger('main-menu');
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
            botsTurn: !playerGoesFirst,
            gameIndex: this.activeGameIndex.state,
            // horrendous lazy deep clone
            gameStateObject: JSON.parse(JSON.stringify(this.gameStateObject.state)),
            branchResult: { ...this.activeGameBranchResult.state },
        }])
    },
    makeSymmetricMove(newGameIndex) {
        const changeDat = Interopt.doBackwardReconstruction(this.activeGameIndex.state, newGameIndex)

        const moveLog = {}

        const newGameStateObject = { ...this.gameStateObject.state }

        const entries = Object.entries(newGameStateObject)

        const entry1 = entries.find(x => changeDat.toPartition === x[1].id)
        const entry2 = changeDat.samePartition
            ? entry1
            : entries.find(x => changeDat.fromPartition === x[1].id && x[0] !== entry1[0])

        const topPartitionIndex = newGameStateObject[entry1[0]].partition.findIndex(x => x.number === changeDat.pieceTop.number)

        moveLog.top = {
            ...newGameStateObject[entry1[0]].partition[topPartitionIndex],
            colorIndex: Number(entry1[0])
        }

        newGameStateObject[entry1[0]].id = changeDat.toPartitionNew
        newGameStateObject[entry1[0]].partition[topPartitionIndex] = {
            number: changeDat.pieceBottom.number + changeDat.pieceTop.number,
        }

        const bottomPartitionIndex = newGameStateObject[entry2[0]].partition.findIndex(x => x.number === changeDat.pieceBottom.number)

        moveLog.bottom = {
            ...newGameStateObject[entry2[0]].partition[bottomPartitionIndex],
            colorIndex: Number(entry2[0])
        }

        // remove top onto bottom's position
        newGameStateObject[entry1[0]].partition[topPartitionIndex].pos = newGameStateObject[entry2[0]].partition[bottomPartitionIndex].pos
        newGameStateObject[entry2[0]].partition.splice(bottomPartitionIndex, 1)

        if (changeDat.twoChanges) {
            newGameStateObject[entry2[0]].id = changeDat.fromPartitionNew
        } else if (!changeDat.samePartition) {
            delete newGameStateObject[entry2[0]];
        }

        this.applyMove(newGameIndex, newGameStateObject, moveLog);
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
        if (historyIndex === this.history.state.length - 1 && this.activeGameIndex.state === historyIndex) return
        const { gameIndex, branchResult, gameStateObject } = this.history.state[historyIndex]
        if (historyIndex === this.history.state.length - 1) {
            this.historyIndex.trigger(undefined)
        } else {
            this.historyIndex.trigger(historyIndex)
        }
        this.activeGameIndex.trigger(gameIndex);
        this.activeGameBranchResult.trigger(branchResult)
        this.gameStateObject.trigger(gameStateObject)
        this.selectedPieceData.trigger(undefined)
    },
    play() {
        const range = this.initialGamesIndices.state.length
        const initialGameIndex = Math.floor(Math.random() * range)
        this.setBoardFromInitialGameIndex(this.initialGamesIndices.state[initialGameIndex][0])
        this.startGame({ playerGoesFirst: this.activeGameBranchResult.state.guaranteedWin })
        this.playMode.trigger('play')
    },
    explore() {
        this.menu.trigger('initial-conditions')
        this.playMode.trigger('explore')
    },
    getViewingHistoricMove() {
        return (this.historyIndex.state !== undefined)
    },
    getDisplayMistakes() {
        return this.playMode.state === 'explore' || this.gameOverResult.state
    }
};

export default gameState;
