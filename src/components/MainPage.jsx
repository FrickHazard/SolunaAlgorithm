import React from 'react';

export const MainPage = (props) => {

    const [state, setState] = React.useState({ hidden: false });

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
            !state.hidden ? <div style={{ maxHeight: '80%', padding: 8, background: 'white', pointerEvents:'auto', overflowY: 'auto'}}>
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
                    {props.initialGames.map((gameState, i) => (<li key={i} onClick={() => { setState({hidden: true }); props.onSelect(gameState); }}>
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
