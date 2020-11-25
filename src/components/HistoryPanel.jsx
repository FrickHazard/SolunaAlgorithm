import React from 'react';
import { panelColor } from './panelColor'
import { WhiteText } from './WhiteText.jsx'

export const HistoryPanel = ({ history, setGameFromHistory }) => {
    if (!history) return null
    return <div style={{
        position: 'absolute', left: 0, top: 0,
        backgroundColor: panelColor,
        pointerEvents: 'auto',
        overflowY: 'auto',
        borderWidth: '1px',
        boxShadow: '4px',
        borderRadius: '16px',
        padding: '20px 20px'
    }}>
        <div>
            <WhiteText style={{ margin: 0, fontSize: 20 }}>History</WhiteText>
        </div>
        <ul style={{ overflow: 'scroll', padding: 0, margin: 0 }}>
            {history.map((item, i) => {

                const mistake = (i < history.length - 1)
                    && item.branchResult.guaranteedWin
                    && history[i + 1].branchResult.guaranteedWin
                return <li
                    key={i}
                    style={{ flexDirection: 'row', display: 'flex' }}
                    onClick={() => setGameFromHistory(i)}
                >
                    <div style={{ color: 'white' }}>
                        Id: {item.gameIndex}
                        {mistake ? '--Mistake' : null}
                    </div>

                </li>
            })}
        </ul>
    </div>
}