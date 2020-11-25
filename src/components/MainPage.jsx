import React, { useState } from 'react';
import GameState, { useStateEffect } from '../GameState';
import { KeyValue } from './KeyValue.jsx'
import { InitialStateList } from './InitialStateList.jsx'
import { WhiteText } from './WhiteText.jsx'
import { TurnDisplay } from './TurnDisplay.jsx'
import { panelColor } from './panelColor'
import { HistoryPanel } from './HistoryPanel.jsx'

export const MainPage = (props) => {
    const [menuState, setMenuState] = useState(GameState.menu.state)
    const [initialGameStates, setInitialGameStates] = useState([]);
    const [activeGameIndex, setActiveGameIndex] = useState(GameState.activeGameIndex.state);
    const [activeGameBranchResult, setActiveGameBranchResult] = useState(GameState.activeGameBranchResult.state);
    const [botsTurn, setBotsTurn] = useState(GameState.botsTurn.state)
    const [history, setHistory] = useState(GameState.history.state)

    useStateEffect(GameState.activeGameIndex.subscribe(setActiveGameIndex))
    useStateEffect(GameState.activeGameBranchResult.subscribe(setActiveGameBranchResult))
    useStateEffect(GameState.initialGamesIndices.subscribe(setInitialGameStates));
    useStateEffect(GameState.menu.subscribe(setMenuState));
    useStateEffect(GameState.botsTurn.subscribe(setBotsTurn));
    useStateEffect(GameState.history.subscribe(setHistory));

    let centerPanel = null
    switch (menuState) {
        case 'initial-conditions':
            centerPanel = (
                <InitialStateList initialGameStates={initialGameStates} onSelect={(gameIndex) => {
                    GameState.menu.trigger('first-or-last');
                    GameState.setBoardFromInitialGameIndex(gameIndex)
                }} />
            );
            break;
        case 'first-or-last':
            centerPanel = (
                <>
                    <div>
                        <WhiteText>Go First?</WhiteText>
                    </div>
                    <button onClick={() => {
                        GameState.startGame({ playerGoesFirst: true })
                    }}>Yes</button>
                    <button onClick={() => {
                        GameState.startGame({ playerGoesFirst: false })
                    }}>No</button>
                    <div>
                        <WhiteText>
                            {activeGameBranchResult.guaranteedWin
                                ? 'Player 1 can deterministically win.'
                                : 'Player 2 can deterministically win.'
                            }
                        </WhiteText>
                    </div>
                </>
            )
            break;
        case 'game-over':
            centerPanel = (
                <>
                    <div>
                        {botsTurn ? <WhiteText>You Win!🎉</WhiteText> : <WhiteText>You Lose!☹️</WhiteText>}
                    </div>
                    <button onClick={() => GameState.restart()}>Reset Game</button>
                </>
            )
            break;
    }

    return <div style={{
        width: '100%',
        height: '100%   ',
        position: 'fixed',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none'
    }}>
        {
            centerPanel
                ? <div
                    style={{
                        maxHeight: '80%',
                        padding: 8,
                        backgroundColor: panelColor,
                        pointerEvents: 'auto',
                        overflowY: 'auto',
                        borderWidth: '1px',
                        boxShadow: '4px',
                        borderRadius: '16px',
                        padding: '20px 20px'
                    }}>
                    {centerPanel}
                </div>
                : null
        }
        {
            activeGameIndex ?
                <>
                    <div style={{ position: 'absolute', right: 0, bottom: 0, backgroundColor: panelColor, borderRadius: '2%', padding: '8px' }}>
                        <KeyValue label={'Game Index: '} value={activeGameIndex.toString()} />
                        <KeyValue label={'Leaf Count: '} value={activeGameBranchResult.leafCount} />
                        <KeyValue label={'Leaf Victory:  '} value={activeGameBranchResult.leafVictory} />
                        <KeyValue label={'Deterministic Win: '} value={activeGameBranchResult.guaranteedWin.toString()} />
                    </div>
                </>
                : null
        }
        <TurnDisplay botsTurn={botsTurn} />
        <HistoryPanel history={history} setGameFromHistory={GameState.setGameFromHistory} />
    </div>
};
