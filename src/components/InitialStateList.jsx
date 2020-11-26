import React from 'react';
import { WhiteText } from './WhiteText.jsx'


export const InitialGameState = ({ gameState }) => {
    return gameState.map((partitions, colorIndex) => (
        <div key={colorIndex} style={{ display: 'flex', flexDirection: 'row' }}>
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
            }</div>))
}

export const InitialStateList = ({ initialGameStates, onSelect }) => <>
    <div>
        <WhiteText style={{ margin: 0, fontSize: 20 }}>Choose Starting Board</WhiteText>
    </div>
    <ol style={{ overflow: 'scroll', padding: 0, margin: 0 }}>
        {initialGameStates.map(([gameIndex, gameState], listIndex) => (
            <li key={gameIndex}
                style={{ flexDirection: 'row', display: 'flex' }}
                onClick={() => {
                    console.log(gameIndex, listIndex)
                    onSelect(gameIndex);
                }}>
                <div style={{ color: 'white', display: 'flex', flexDirection: 'row', fontWeight: 'bold', fontSize: '20px', width: '35px' }}>{listIndex + 1}.</div>
                <InitialGameState gameState={gameState} />
            </li>))
        }
    </ol>
</>
