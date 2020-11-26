import GameState from './GameState';
import Interopt from './interopt'

const botSystem = {
    onTurnChange(botsTurn) {
        if (botsTurn) {
            setTimeout(() => {
                if (!GameState.botsTurn.state || GameState.getViewingHistoricMove()) return
                const gameStateIndex = GameState.activeGameIndex.state;
                const nextPossibleGameStateIndices = Interopt.getNextPossibleGameStateIndices(gameStateIndex);
                if (nextPossibleGameStateIndices.length === 0) {
                    return
                }
                let highestBranchCountForOpponentToMakeMistake = 0;
                let highestBranchCountForOpponentToMakeMistake_i = nextPossibleGameStateIndices[0];
                for (const gameIndex of nextPossibleGameStateIndices) {
                    const branchResult = Interopt.getBranchResult(gameIndex);
                    if (branchResult.guaranteedWin === false) {
                        GameState.makeSymmetricMove(gameIndex);
                        return;
                    }
                    const branchCountForOpponentToMakeMistake = branchResult.leafCount - branchResult.leafVictory
                    if (branchCountForOpponentToMakeMistake > highestBranchCountForOpponentToMakeMistake) {
                        highestBranchCountForOpponentToMakeMistake = branchCountForOpponentToMakeMistake;
                        highestBranchCountForOpponentToMakeMistake_i = gameIndex;
                    }
                }
                GameState.makeSymmetricMove(highestBranchCountForOpponentToMakeMistake_i);
            }, 1000)
        }
    },
    init() {
        GameState.botsTurn.subscribe(this.onTurnChange.bind(this))
    }
}

export default botSystem
