import React, { useState } from 'react';
import GameState, { useStateEffect } from '../GameState';
import { KeyValue } from './KeyValue.jsx'
import { InitialStateList } from './InitialStateList.jsx'
import { WhiteText } from './WhiteText.jsx'
import { TurnDisplay } from './TurnDisplay.jsx'
import { panelColor } from './panelColor'

export const MainPage = (props) => {
    const [menuState, setMenuState] = useState(GameState.menu.state)
    const [initialGameStates, setInitialGameStates] = useState([]);
    const [activeGameIndex, setActiveGameIndex] = useState(GameState.activeGameIndex.state);
    const [botsTurn, setBotsTurn] = useState(GameState.botsTurn.state)

    useStateEffect(GameState.activeGameIndex.subscribe(setActiveGameIndex))
    useStateEffect(GameState.initialGamesIndices.subscribe(setInitialGameStates));
    useStateEffect(GameState.menu.subscribe(setMenuState));
    useStateEffect(GameState.botsTurn.subscribe(setBotsTurn));

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
            menuState === 'initial-conditions' || menuState === 'first-or-last'
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
                    {
                        menuState === 'initial-conditions'
                            ? <InitialStateList initialGameStates={initialGameStates} onSelect={(gameIndex) => {
                                GameState.menuSetState('first-or-last');
                                GameState.resetBoard(gameIndex)
                            }} />
                            : <>
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
                                        {activeGameIndex[2].guaranteedWin
                                            ? 'Player 1 can deterministically win.'
                                            : 'Player 2 can deterministically win.'
                                        }
                                    </WhiteText>
                                </div>
                            </>
                    }
                </div>
                : null
        }
        {
            activeGameIndex ?
                <>
                    <div style={{ position: 'absolute', right: 0, bottom: 0, backgroundColor: panelColor, borderRadius: '2%', padding: '8px' }}>
                        <KeyValue label={'Game Index: '} value={activeGameIndex[0].toString()} />
                        <KeyValue label={'Leaf Count: '} value={activeGameIndex[2].leafCount} />
                        <KeyValue label={'Leaf Victory:  '} value={activeGameIndex[2].leafVictory} />
                        <KeyValue label={'Deterministic Win: '} value={activeGameIndex[2].guaranteedWin.toString()} />
                    </div>
                </>
                : null
        }
        <TurnDisplay botsTurn={botsTurn} />
    </div>
};
