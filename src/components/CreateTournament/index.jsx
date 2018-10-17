import React from 'react';
import { inject, observer } from 'mobx-react';
import { Button } from '@material-ui/core';

const CreateTournament = ({ gameStore }) => (
    <Button onClick={() => {
    	    if(!localStorage.getItem('game')){
      localStorage.setItem('game', JSON.stringify(gameStore.gameBracket));
    }
    }}>
        Create Tournament!
    </Button>
)
export default inject('gameStore')(observer(CreateTournament));