import React, { useState } from 'react';
import GameState, { useStateEffect } from '../GameState';

const WhiteText = ({ children, style }) => {
    return <p style={{ ...style, color: 'white' }}>{children}</p>
}

const panelColor = '#666699';

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
                            ? <>
                                <div>
                                    <WhiteText style={{ margin: 0, fontSize: 20 }}>Select Initial Conditions</WhiteText>
                                </div>
                                <ol style={{ overflow: 'scroll', padding: 0, margin: 0 }}>
                                    {initialGameStates.map(([gameIndex, gameState], listIndex) => (
                                        <li key={gameIndex}
                                            style={{ flexDirection: 'row', display: 'flex' }}
                                            onClick={() => {
                                                GameState.menuSetState('first-or-last');
                                                GameState.resetBoard(gameIndex);
                                            }}>
                                            <div style={{ color: 'white', display: 'flex', flexDirection: 'row', fontWeight: 'bold', fontSize: '20px', width: '35px' }}>{listIndex + 1}.</div>
                                            {gameState.map((partitions, colorIndex) => <div key={colorIndex} style={{ display: 'flex', flexDirection: 'row' }}>
                                                {partitions.map((partition) => {
                                                    const result = [];
                                                    for (let i = 0; i < partition.count; ++i) {
                                                        if (i === 0 && colorIndex !== 0) result.push(<div key={`${i}+`} style={{ color: 'white', display: 'flex', flexDirection: 'row', fontWeight: 'bold', fontSize: '20px' }}>/</div>)
                                                        result.push(<div key={i} style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            backgroundColor: '#666666',
                                                            borderRadius: '50%',
                                                            justifyContent: 'center',
                                                            alignItems: 'center'
                                                        }}>
                                                            <p key={i} style={{ color: '#ffff00', display: 'inline' }}>
                                                                {`${colorIndex}`}
                                                            </p>
                                                        </div>)
                                                    }
                                                    return result;
                                                })
                                                }</div>)
                                            }</li>))
                                    }
                                </ol>
                            </>
                            : <>
                                <div>
                                    <WhiteText>Go first</WhiteText>
                                </div>
                                <button onClick={() => {
                                    GameState.startGame({ playerGoesFirst: true })
                                }}>Yes</button>
                                <button onClick={() => {
                                    GameState.startGame({ playerGoesFirst: false })
                                }}>No</button>
                            </>
                    }
                </div>
                : null
        }
        {
            <>
                <div style={{ position: 'absolute', right: 0, bottom: 0, backgroundColor: panelColor, borderRadius: '2%', }}>
                    <WhiteText>{activeGameIndex ? activeGameIndex[0].toString() : ''}</WhiteText>
                    {
                        activeGameIndex ? <>
                            <WhiteText>Leaf Count: {activeGameIndex[2].leafCount}</WhiteText>
                            <WhiteText>Leaf Victory: {activeGameIndex[2].leafVictory}</WhiteText>
                            <WhiteText>Guaranteed Win: {activeGameIndex[2].guaranteedWin.toString()}</WhiteText>
                        </>
                            : null
                    }
                </div>
            </>
        }
        {
            <div style={{ position: 'absolute', top: 0, left: '50%', backgroundColor: panelColor, borderRadius: '2%', }}>
                {
                    botsTurn === undefined ? null
                        : botsTurn
                            ? <WhiteText>Bots Turn </WhiteText>
                            : <WhiteText>Your Turn</WhiteText>
                }
            </div>
        }
    </div>
};
