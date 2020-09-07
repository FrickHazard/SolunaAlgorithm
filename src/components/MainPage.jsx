import React from 'react';
import GameState, { useStateEffect } from '../GameState';

export const MainPage = (props) => {

    const [hidden, setHidden] = React.useState({ hidden: false });
    const [initialGameStates, setInitialGameStates] = React.useState([]);

    useStateEffect(GameState.initialGamesIndices.subscribe(setInitialGameStates));

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
            !hidden.hidden ? <div style={{ maxHeight: '80%', padding: 8, background: 'white', pointerEvents:'auto', overflowY: 'auto'}}>
                <div>
                    <button>Play Soluna</button>
                </div>
                <div>
                    <p>Explore Soluna Board Space</p>
                </div>
                <div>
                    <p>Initial Conditions</p>
                </div>
                <ol style={{overflow: 'scroll' }}>
                    {initialGameStates.map(([gameIndex, gameState]) => (<li key={gameIndex}
                            onClick={() => { 
                                setHidden({hidden: true });
                                GameState.setActiveGameIndex(gameIndex);
                            }}
                        >
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
            : null
        }
    
    </div>
};
