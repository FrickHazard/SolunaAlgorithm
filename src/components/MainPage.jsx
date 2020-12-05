import React, { useState } from 'react';
import GameState, { useStateEffect } from '../GameState';
import { InitialStateList } from './InitialStateList.jsx'
import { WhiteText } from './WhiteText.jsx'
import { panelColor } from './panelColor'
import { HistoryPanel } from './HistoryPanel.jsx'
import { RightPanel } from './RightPanel.jsx';
import { MainMenu } from './MainMenu.jsx'
import { Button } from './Button.jsx'
import { DocumenationAndInstuctions } from './DocumentationAndInstuctions.jsx'

export const MainPage = (props) => {
    const [menuState, setMenuState] = useState(GameState.menu.state)
    const [showInstructions, setShowInstructions] = useState(GameState.showInstructions.state)
    const [initialGameStates, setInitialGameStates] = useState([]);
    const [activeGameIndex, setActiveGameIndex] = useState(GameState.activeGameIndex.state);
    const [activeGameBranchResult, setActiveGameBranchResult] = useState(GameState.activeGameBranchResult.state);
    const [botsTurn, setBotsTurn] = useState(GameState.botsTurn.state)
    const [history, setHistory] = useState(GameState.history.state)
    const [historyIndex, setHistoryIndex] = useState(GameState.historyIndex.state)
    const [playMode, setPlayMode] = useState(GameState.playMode.state)
    const [gameOverResult, setGameOverResult] = useState(GameState.gameOverResult.state)

    useStateEffect(GameState.activeGameIndex.subscribe(setActiveGameIndex))
    useStateEffect(GameState.activeGameBranchResult.subscribe(setActiveGameBranchResult))
    useStateEffect(GameState.initialGamesIndices.subscribe(setInitialGameStates));
    useStateEffect(GameState.menu.subscribe(setMenuState));
    useStateEffect(GameState.botsTurn.subscribe(setBotsTurn));
    useStateEffect(GameState.history.subscribe(setHistory));
    useStateEffect(GameState.historyIndex.subscribe(setHistoryIndex));
    useStateEffect(GameState.playMode.subscribe(setPlayMode));
    useStateEffect(GameState.gameOverResult.subscribe(setGameOverResult));
    useStateEffect(GameState.showInstructions.subscribe(setShowInstructions));

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
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <Button onClick={() => {
                        GameState.startGame({ playerGoesFirst: true })
                    }}>Go First</Button>
                    <Button onClick={() => {
                        GameState.startGame({ playerGoesFirst: false })
                    }}>Go Second</Button>
                    <div>
                        <WhiteText style={{ fontSize: 20 }}>
                            {activeGameBranchResult.guaranteedWin
                                ? 'Player 1 can Force a win.'
                                : 'Player 2 can Force a win.'
                            }
                        </WhiteText>
                    </div>
                </div>
            )
            break;
    }

    if (menuState === 'main-menu') return <>
        <DocumenationAndInstuctions showInstructions={showInstructions} setShowInstuctions={x => GameState.showInstructions.trigger(x)} />
        <MainMenu />
    </>

    return <div style={{
        width: '100%',
        height: '100%   ',
        position: 'fixed',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
        margin: 0,
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
        <RightPanel
            botsTurn={botsTurn}
            history={history}
            historyIndex={historyIndex}
            activeGameIndex={activeGameIndex}
            activeGameBranchResult={activeGameBranchResult}
            gameOverResult={gameOverResult}
        />
        <HistoryPanel
            history={history}
            setGameFromHistory={(historyIndex) => GameState.setGameFromHistory(historyIndex)}
            playMode={playMode}
            historyIndex={historyIndex}
        />
    </div>
};
