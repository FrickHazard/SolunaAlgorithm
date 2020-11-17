import React from 'react'
import { panelColor } from './panelColor'
import { WhiteText } from './WhiteText.jsx'

export const TurnDisplay = ({ botsTurn }) => botsTurn !== undefined ? (
    <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        backgroundColor: panelColor,
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px',
        padding: '8px',
    }}>
        {
            botsTurn
                ? <WhiteText>Bots Turn </WhiteText>
                : <WhiteText>Your Turn</WhiteText>
        }
    </div>)
    : null