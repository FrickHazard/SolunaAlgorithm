import React from 'react'
import GameState from '../GameState'
import { panelColor } from './panelColor'
import { WhiteText } from './WhiteText.jsx'
import { KeyValue } from './KeyValue.jsx'

export const RightPanel = ({ activeGameIndex, activeGameBranchResult, botsTurn, history, historyIndex, gameOverResult }) => {
    if (!activeGameIndex) return null
    return <div style={{ position: 'absolute', right: 0, bottom: 0, backgroundColor: panelColor, borderRadius: '2%', padding: '8px' }}>
        {
            gameOverResult
                ? <>
                    <div>
                        {gameOverResult.botWon ? <WhiteText>You Lose!☹️</WhiteText> : <WhiteText>You Win!🎉</WhiteText>}
                    </div>
                    <button onClick={() => GameState.restart()}>Reset Game</button>
                    <div style={{ backgroundColor: 'white', height: 1, marginBottom: 10, marginTop: 10 }} />
                </>
                : null
        }
        {
            GameState.getViewingHistoricMove()
                ? <WhiteText>{history[historyIndex + 1].botsTurn ? 'Bots Move' : 'Your Move'}</WhiteText>
                : botsTurn !== undefined
                    ? <WhiteText>{botsTurn ? 'Bot\'s turn 🤖' : 'Your Turn'}</WhiteText>
                    : null
        }
        <div style={{ backgroundColor: 'white', height: 1, marginBottom: 10, marginTop: 10 }} />
        <KeyValue label={'Board State Index: '} value={activeGameIndex.toString()} />
        <KeyValue label={'Leaf Count: '} value={activeGameBranchResult.leafCount} />
        <KeyValue label={'Leaf Victory:  '} value={activeGameBranchResult.leafVictory} />
        <KeyValue label={'Player Can Force a Win: '} value={activeGameBranchResult.guaranteedWin.toString()} />
    </div>
}