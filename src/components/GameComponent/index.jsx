import React from 'react';
import { BracketGame } from 'react-tournament-bracket'; 
import { inject, observer } from 'mobx-react';
import SetScores from './SetScore';

const GC = (props) => {
	const { gameStore } = props;
    const propsClone = { ...props, gameStore: undefined }
		return <BracketGame
        {...propsClone}
        hoveredTeamId={gameStore.hoveredTeamId}
        onHoveredTeamIdChange={(e) => gameStore.hoverTeamChange(e)}
        onClick={()=>gameStore.openGameControllerDialog(props.game, <SetScores  game={props.game} />)}
        styles={
        	{
            backgroundColor: '#58595e',
            hoverBackgroundColor: '#222',
            scoreBackground: '#787a80',
            winningScoreBackground: '#00C4FB',
            teamNameStyle: { fill: '#fff', fontSize: 12, textShadow: '1px 1px 1px #222' },
            teamScoreStyle: { fill: '#23252d', fontSize: 12 },
            gameNameStyle: { fill: '#999', fontSize: 10 },
            gameTimeStyle: { fill: '#999', fontSize: 10 },
            teamSeparatorStyle: { stroke: '#444549', strokeWidth: 1 }
        }}
    />
};

export default inject('gameStore')(observer(GC));