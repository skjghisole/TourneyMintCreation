import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import { HashRouter as Router } from 'react-router-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import App from './App';
import {
    RootStore,
    GameStore,
    UIStore,
    FormStore,
    ProviderStore
} from './stores';

const rootStore = new RootStore();
const gameStore = new GameStore(rootStore);
const uiStore = new UIStore(rootStore)
const formStore = new FormStore(rootStore);
const providerStore = new ProviderStore(rootStore);

const stores = {
    rootStore,
    gameStore,
    uiStore,
    formStore,
    providerStore
};

rootStore.setStore(stores);

ReactDOM.render(
    <Router>
        <Provider {...stores}>
            <App />
        </Provider>
    </Router>
, document.getElementById('root'));
registerServiceWorker();
