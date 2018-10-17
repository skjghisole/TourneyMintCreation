import React from 'react';
import { inject, observer } from 'mobx-react';
import { TextField, Grid, Button } from '@material-ui/core';

const SetScores = ({ game, gameStore }) => (
    <Grid container>
        <Grid item sm={12}>
            <TextField
                label={game.sides.home.team.name}
                type={'number'}
                fullWidth
                onChange={({ target: { value } }) => gameStore.setHomeScore(game, value)}
            />
        </Grid>
        <Grid item sm={12}>
            <TextField
                label={game.sides.visitor.team.name}
                type={'number'}
                fullWidth
                onChange={({ target: { value } }) => gameStore.setVisitorScore(game, value)}
            />
        </Grid>
        <Grid item sm={12}>
            <Button onClick={() => gameStore.submitScores(game)}>
            	Submit
            </Button>
        </Grid>
    </Grid>
)

export default inject('gameStore')(observer(SetScores))