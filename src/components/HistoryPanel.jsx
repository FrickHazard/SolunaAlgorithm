import React from 'react';
import { panelColor } from './panelColor'
import { WhiteText } from './WhiteText.jsx'
import GameState from '../GameState'
import { PieceIcon } from './InitialStateList.jsx'

export const HistoryPanel = ({ history, setGameFromHistory, playMode }) => {
    if (!history) return null
    return <div style={{
        position: 'absolute', left: 0, top: 0,
        backgroundColor: panelColor,
        pointerEvents: 'auto',
        overflowY: 'auto',
        borderWidth: '1px',
        boxShadow: '4px',
        borderRadius: '16px',
        borderTopLeftRadius: 0,
        padding: '20px 20px'
    }}>
        <div>
            <WhiteText style={{ margin: 0, fontSize: 20 }}>Move History</WhiteText>
        </div>
        <ul style={{ overflow: 'scroll', padding: 0, margin: 0 }}>
            {history.map((item, i) => {
                if (i === history.length - 1) return null
                const mistake = item.branchResult.guaranteedWin
                    && history[i + 1].branchResult.guaranteedWin
                return <li
                    key={i}
                    style={{ flexDirection: 'row', display: 'flex' }}
                    onClick={() => setGameFromHistory(i)}
                >
                    <div style={{ color: 'white', flexDirection: 'row', display: 'flex', alignItems: 'center' }}>
                        {(history[i + 1].botsTurn) ? '🤖' : '😀'}
                        {' Moved '}
                        <PieceIcon
                            styles={{ marginLeft: '4px', marginRight: '4px' }}
                            colorIndex={history[i + 1].moveLog.top.colorIndex} />{`x${history[i + 1].moveLog.top.number}`}
                        {' onto '}
                        <PieceIcon
                            styles={{ marginLeft: '4px', marginRight: '4px' }}
                            colorIndex={history[i + 1].moveLog.bottom.colorIndex} />{`x${history[i + 1].moveLog.bottom.number}`}
                        {GameState.getDisplayMistakes() && mistake ? '-M' : null}
                    </div>

                </li>
            })}
            <li
                style={{ flexDirection: 'row', display: 'flex' }}
                onClick={() => setGameFromHistory(history.length - 1)}
            >
                <div style={{ color: 'white' }}>
                    {'Current'}
                </div>
            </li>
        </ul>
    </div>
}