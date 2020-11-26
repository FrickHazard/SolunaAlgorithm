import React from 'react'
import GameState from '../GameState'

export const MainMenu = ({ }) => {
    return <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translateX(-50%) translateY(-50%)'
        }}
    >
        <div style={{ fontSize: 40, color: 'white', textAlign: 'center', fontWeight: 'bold' }} >Soluna</div>
        <button style={{ fontSize: 20, margin: 10 }} onClick={() => GameState.play()}>Play</button>
        <button style={{ fontSize: 20, margin: 10 }} onClick={() => GameState.explore()}>Explore</button>
        <button style={{ fontSize: 20, margin: 10 }}>Documentation and Instructions</button>
    </div>
}