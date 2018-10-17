import { observable, action } from 'mobx';
import Web3 from 'web3';

class ProviderStore {
    constructor(rootStore) {
        this._rootStore = rootStore;
    }

    @observable web3 = window.web3;
    @observable accounts = undefined;

    @action
    connect = async () => {
        this.connectWeb3();
        if (this.web3 !== undefined) {
            const accounts = await this.web3.eth.getAccounts();
            this.accounts = accounts;
        }
        return;
    }

    connectWeb3 = () => {
        const alreadyInjected = typeof this.web3 !== "undefined";

        if (alreadyInjected) {
            this.web3 = new Web3(this.web3.currentProvider);
        }
    }
}

export default ProviderStore;
