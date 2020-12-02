import React from 'react';
import { WhiteText } from './WhiteText.jsx'
import MoonSVG from '../assets/svgs/moon1.svg'
import ShootingStarSVG from '../assets/svgs/shooting-star.svg'
import SunSVG from '../assets/svgs/sun.svg'
import StarSVG from '../assets/svgs/star.svg'


const getSymbol = (index) => {
    switch (index) {
        case 0: return MoonSVG
        case 1: return ShootingStarSVG
        case 2: return StarSVG
        case 3: return SunSVG
    }
}

export const PieceIcon = ({ colorIndex, styles }) => {
    return <div style={{
        width: '20px',
        height: '20px',
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#0e008c',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        ...styles
    }}>
        <img src={getSymbol(colorIndex)} style={{ width: 14, height: 14 }} />
    </div >
}

export const InitialGameState = ({ gameState }) => {
    return gameState.map((partitions, colorIndex) => (
        <div key={colorIndex} style={{ display: 'flex', flexDirection: 'row' }}>
            {partitions.map((partition) => {
                const result = [];
                for (let i = 0; i < partition.count; ++i) {
                    if (i === 0 && colorIndex !== 0) result.push(<div key={`${i}+`} style={{ color: 'white', display: 'flex', flexDirection: 'row', fontWeight: 'bold', fontSize: '20px' }}>/</div>)
                    result.push(<PieceIcon colorIndex={colorIndex} key={i} />)
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
                    // console.log(gameIndex, listIndex)
                    onSelect(gameIndex);
                }}>
                <div style={{ color: 'white', display: 'flex', flexDirection: 'row', fontWeight: 'bold', fontSize: '20px', width: '35px' }}>{listIndex + 1}.</div>
                <InitialGameState gameState={gameState} />
            </li>))
        }
    </ol>
</>
