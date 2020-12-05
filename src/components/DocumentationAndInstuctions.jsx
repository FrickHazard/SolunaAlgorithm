import React from 'react'
import { Markdown } from './MarkdownAndLatex.jsx';
import source from '../../instructions.md'
import { panelColor } from './panelColor'

export const DocumenationAndInstuctions = ({ showInstructions, setShowInstuctions }) => {
    if (!showInstructions) return null
    return <div style={{
        padding: 40,
        position: 'absolute',
        width: 800,
        left: '50%',
        transform: 'translate(-50%)',
        backgroundColor: panelColor,
        pointerEvents: 'auto',
        zIndex: 5
    }}>
        <div style={{
            overflow: 'scroll',
            height: '90vh',
            pointerEvents: 'auto',
        }}>
            <Markdown source={source} />
        </div>
        <div style={{ position: 'absolute', right: 5, top: 5 }}>
            <button
                onClick={() => setShowInstuctions(false)}
                style={{ width: 30, height: 30, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <p style={{ fontSize: 20 }}>X</p>
            </button>
        </div>
    </div>
}
