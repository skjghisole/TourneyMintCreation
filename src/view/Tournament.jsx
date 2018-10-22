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

    const { listenChampion, setDateToStart } = gameStore;
    setInterval(() => {
      listenChampion();
      setDateToStart();
    }, 2500);
  }

  componentWillUnmount() {
    const { gameStore } = this.props;
    const { clearContract } = gameStore;
    clearContract();
  }

  render() {
    const { gameStore } = this.props;
    const { game, tournamentChampion, tournament, status, openBettingWindow, startTournament, _dateToStart } = gameStore;
    return <Grid container justify={"center"} alignContent={"center"} direction="column">
            <h1>Tournament Status: {status}</h1>
            <Grid item sm={12}>
              {
                status === 'pending' &&
                <Button variant="outlined" onClick={()=>openBettingWindow()}>Open Betting Window</Button>
              }
              {
                status === 'betting'
                  && (_dateToStart 
                  ? <TimeAgo date={_dateToStart*1000} />
                  : _dateToStart === 0
                  && <Button variant="outlined" onClick={()=>startTournament()}>Start Tournament</Button>)
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