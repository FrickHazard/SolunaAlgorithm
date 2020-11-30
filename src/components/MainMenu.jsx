import React from 'react'
import GameState from '../GameState'
import { Button } from './Button.jsx'

export const MainMenu = ({ }) => {
    return <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translateX(-50%) translateY(-50%)',
        }}
    >
        <div style={{ fontSize: 40, color: 'white', textAlign: 'center', fontWeight: 'bold' }} >Soluna Solved</div>
        <Button onClick={() => GameState.play()}>Play</Button>
        <Button onClick={() => GameState.explore()}>Explore</Button>
        <Button>Rules and Description</Button>
    </div>
}