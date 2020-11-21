import React from 'react';
import { WhiteText } from './WhiteText.jsx'
import { InitialGameState } from './InitialStateList.jsx'

export const LeftPanel = ({ initialGameState, history }) => <div style={{ position: 'absolute', left: 0, top: 0 }}>
    <div>
        <WhiteText style={{ margin: 0, fontSize: 20 }}>Select Initial Conditions</WhiteText>
    </div>
    <InitialGameState initialGameState={initialGameState} />
</div>
