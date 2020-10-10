import GameState from './GameState';
import Interopt from './interopt'

const botSystem = {
    onTurnChange(p1sTurn) {
        if (p1sTurn === false) {
            const gameStateIndex = GameState.activeGameIndex.state[0];
            const nextPossibleGameStateIndices = Interopt.getNextPossibleGameStateIndices(gameStateIndex);
            if (nextPossibleGameStateIndices.length === 0) return;
            let highestBranchCountForOpponentToMakeMistake = 0;
            let highestBranchCountForOpponentToMakeMistake_i = 0;
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
        }
    },
    init() {
        GameState.p1sTurn.subscribe(this.onTurnChange.bind(this))
    }
}

export default botSystem
