import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import Home from '../view/Home';
import PageNotFound from '../view/PageNotFound';
import CreateTournament from '../view/CreateTournamentView';
import Tournament from '../view/Tournament';
import TournamentHome from '../view/TournamentHome';

const RoutedApp = () => (
	<div>
    <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/create" component={CreateTournament} />
        <Route exact path="/tournament/" component={TournamentHome} />
        <Route path="/tournament/:id" component={Tournament} />
        <Route path="*" component={PageNotFound}/>
    </Switch>
  </div>
)

export default withRouter(RoutedApp);
