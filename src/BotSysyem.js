import GameState from './GameState';
import Interopt from './interopt'

const botSystem = {
    onTurnChange(botsTurn) {
        if (botsTurn) {
            const gameStateIndex = GameState.activeGameIndex.state[0];
            const nextPossibleGameStateIndices = Interopt.getNextPossibleGameStateIndices(gameStateIndex);
            if (nextPossibleGameStateIndices.length === 0) {
                GameState.initialGamesIndices.state.sort(() => Math.random() - 0.5);
                // function shuffle(array) {
                //     array.sort(() => Math.random() - 0.5);
                //   }
                GameState.resetBoard(GameState.initialGamesIndices.state[0][0]);
                GameState.startGame({ playerGoesFirst: false })
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
        }
    },
    init() {
        GameState.botsTurn.subscribe(this.onTurnChange.bind(this))
    }
}

export default botSystem
