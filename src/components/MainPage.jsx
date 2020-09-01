import React from 'react';

export const MainPage = (props) => {  
    return <div style={{
        width: '100%',
        height: '100%   ',
        position: 'absolute',
        zIndex: 2,
        display: 'flex',    
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',     
        pointerEvents: 'none'

    }}>
        <div style={{ maxHeight: '80%', padding: 8, background: 'white', pointerEvents:'auto', overflowY: 'auto'}}>
            <ol style={{overflow: 'scroll' }}>
                {props.initialGames.map((gameState, i) => (<li key={i} onClick={() => props.onSelect(gameState)}>
                    {gameState.map((partitions, i) =><div key={i} style={{display: 'inline'}}>
                        {partitions.map((partition, i) =>
                            <p key={i} style={{display: 'inline'}}>
                                {`Color ${i + 1}: ${partition.number} * ${partition.count}; `}
                            </p>)
                        }</div>)
                    }</li>))
                }
            </ol>
        </div>
    </div>
};
