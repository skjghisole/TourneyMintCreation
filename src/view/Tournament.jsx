import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Bracket } from 'react-tournament-bracket';
import { Grid, Button } from '@material-ui/core';
import GameComponent from '../components/GameComponent';
import TimeAgo from 'react-timeago';

class Tournament extends Component {

  async componentWillMount() {
    const { match: { params: { id } }, gameStore } = this.props;
    const { deployContract, updateHash, getTournamentStatus } = gameStore;
    await deployContract(id);
    await updateHash();
    getTournamentStatus()
  }

  async componentDidMount() {
    const { gameStore } = this.props;
    const { getTournamentStatus, listenGames, listenChampion } = gameStore;
    setInterval(() => {
      listenGames()
      getTournamentStatus()
      listenChampion()
    }, 2500);
  }


  render() {
    const { gameStore } = this.props;
    const { game, tournamentChampion, tournament, status, timeLeft, openBettingWindow, startTournament } = gameStore;
    return <Grid container justify={"center"} alignContent={"center"} direction="column">
            <h1>Tournament Status: {status}</h1>
            <Grid item sm={12}>
              {
                status === 'pending' &&
                <Button variant="outlined" onClick={()=>openBettingWindow()}>Open Betting Window</Button>
              }
              {
                status === 'betting' && (timeLeft > 0 && timeLeft*1000 > Date.now() ? <TimeAgo date={timeLeft*1000}/>  : <Button variant="outlined" onClick={()=>startTournament()}>Start Tournament</Button>)
              }
            </Grid>
            <Grid item sm={12}>
              {status === "ongoing" && game ? <Bracket 
                roundSeparatorWidth={100}
                game={game} GameComponent={GameComponent}/> : 'loading...'} 
            </Grid>
            <Grid item sm={12}>
              <p>{tournament && tournament.name} Champion: <h1>{tournamentChampion}</h1></p>
            </Grid>
    </Grid>
  }
}

export default inject('gameStore')(observer(Tournament))