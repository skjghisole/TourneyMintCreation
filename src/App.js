import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';


import logo from './favicon.ico';
import './App.css';
import Dialog from './components/GameComponent/GameComponentDialog';
import RoutedApp from './routes';



class App extends Component {
  componentDidMount() {
    const { providerStore } = this.props;
    const { connect }= providerStore;
    connect();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to TournaMint</h1>
        </header>
        <Dialog />
        <RoutedApp />
      </div>
    );
  }
}

export default inject('gameStore', 'providerStore')(observer(App));