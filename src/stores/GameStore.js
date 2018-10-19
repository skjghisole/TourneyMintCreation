import { observable, action, computed, toJS } from 'mobx';
import Tournament from '../models/Tournament';
import { StringToBytes, BytesToString } from '../utils';
import TruffleContract from 'truffle-contract';
import TournamentContract from '../contracts/Tournament.json';
import TournamentFactory from '../contracts/TournamentContractFactory.json';

async function postHashRequest(buffer) {
  const rawResponse = await fetch('https://tourney-mint-server.herokuapp.com/api/ipfs', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: buffer
  });
  const ipfsHash = await rawResponse.json();
  return ipfsHash;
}

class GameStore {
    constructor(rootStore) {
        this._rootStore = rootStore;
    }

    @observable tournament;
    @observable gameSelected = {};
    @observable hoveredTeamId = null;
    @observable _tournamentChampion = null;
    @observable contract;
    @observable participants;
    @observable tournamentName;
    @observable status;
    @observable timeLeft;
    @observable hasChampion = false;
    @observable redirect = undefined;

   @action
   hoverTeamChange = (team) => {
        this.hoveredTeamId = team
   }


 
   @action
   initTournament = (participants, name) => {
    const tourney = new Tournament(participants, name);
    this.tournament = tourney;
    this.tournament._initializeBracketGame();
    return;
   }

   get tournamentChampion() {
    if(!this.tournament) {
        return;
    } 
    Object.keys(this.tournament).length > 0 && this.tournament.on('tournamentChampion', res => this._tournamentChampion = res.name);
    return this._tournamentChampion; 
   }

   @action
   listenGames = () => {
    this.tournament && this.tournament._listenGames();
   }

   @action
   listenChampion = () => {
       const { contract, _rootStore: { providerStore: { accounts } } } = this;

       this.tournament && this.tournament.on("tournamentChampion", async (res) => {
           if(this.hasChampion) {
               return;
           }
           this.hasChampion = true;
           await contract.setWinner(StringToBytes(res.name), { from: accounts[0] });
           return;
       })
   }

   @computed
   get game() {
       if(this.tournament) {
        return this.tournament._gameBracket;
       }
   }

    @action
    openGameControllerDialog = (game, content) => {
        if(!game.sides.home.team || !game.sides.visitor.team){
            return;
        }
        this._rootStore.uiStore.setDialog(game.name, content);
        this._rootStore.uiStore.openDialog();
    }

    @action
    setHomeScore = (game, value) => {
        this.gameSelected.homeScore = value;
    }

    @action
    setVisitorScore = (game, value) => {
        this.gameSelected.visitorScore = value;
    }

    @action
    submitScores = async (_game) => {
        const { accounts } = this._rootStore.providerStore;
        if(!this.contract){
            return;
        }
        const { homeScore, visitorScore } = this.gameSelected;
        _game.setScore(homeScore, visitorScore);
        this._rootStore.uiStore.closeDialog();
        this.gameSelected = {};
        this.tournament._listenGames();
        
        const buffer = JSON.stringify(this.tournament);
        const ipfsHash = await postHashRequest(buffer);
        const storedResponse = await this.contract.storeGameHash(ipfsHash, { from: accounts[0] });
        console.log(storedResponse);
        console.log(`HASH: ${ipfsHash}`);
        const getStoredHash = await this.contract.getGameHash();
        console.log(`HASH FROM CONTRACT: ${getStoredHash}`);
    }

    @action
    deployContract = async (id) => {
      const { web3 } = this._rootStore.providerStore;
        if(this.contract) {
          return;
        } else {
          const Contract = await TruffleContract(TournamentContract);
          Contract.setProvider(web3.currentProvider);
          const contract = Contract.at(id);
          this.contract = contract;
        }
      const tournamentName = await this.getTournamentName();
      const participants = await this.getParticipants();
      this.initTournament(participants.map(x=>BytesToString(x)), tournamentName)
      return true;
    }

    @action
    updateHash = async () => {
        const { accounts } = this._rootStore.providerStore;
        const hash = await this.contract.getGameHash();
        if (!hash) {
             const participants = await this.getParticipants();
             const tournamentName = await this.getTournamentName();
             await this.initTournament(participants.map(x=>BytesToString(x)), tournamentName);
             const buffer = JSON.stringify(toJS(this.tournament));
             const ipfsHash = await postHashRequest(buffer);
             const storedResponse = await this.contract.storeGameHash(ipfsHash, { from: accounts[0] });
             console.log(storedResponse);
             console.log(`HASH: ${ipfsHash}`);
             const getStoredHash = await this.contract.getGameHash();
             console.log(`HASH FROM CONTRACT: ${getStoredHash}`);
        }
    }

    @action
    getParticipants = async () => {
        if(!this.contract) {
            return;
        }
        const participants = await this.contract.getParticipants();
        return participants;
    }

   @action
   getTournamentName = async () => {
        if(!this.contract) {
            return;
        } 
        const tournamentName = await this.contract.getTournamentName();
        return tournamentName;
    }

    @action
    getTournamentStatus = async () => {
        if(!this.contract) {
            return;
        }
        const tournamentStatus = await this.contract.getTournamentStatus();
        if(tournamentStatus === 'betting') {
            this.getTimeLeft();
        }
        this.status = tournamentStatus;
    }

    @action
    getTimeLeft = async () => {
        if(!this.contract) {
            return;
        }
        if(this.timeLeft) {
            return;
        }
        const timeLeft = await this.contract.dateToStart();
        this.timeLeft = timeLeft.toNumber();
    }

    @action
    createGame = async (module, mainField) => {
      const { web3, accounts } = this._rootStore.providerStore;
      const dynamicData = this._rootStore.formStore.processDynamicData(module);
      const data = dynamicData[mainField];
      const tournamentName = dynamicData[`${mainField}-tournamentName`];
      const teamNames = data.map(x => StringToBytes(x.teamName));

      const rawResponse = await fetch('https://tourney-mint-server.herokuapp.com/api/contracts', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
      const contractAddress = await rawResponse.json();
      const Contract = await TruffleContract(TournamentFactory);
      Contract.setProvider(web3.currentProvider);
      const contract = Contract.at(contractAddress);
      const tournamentContract = await contract.createTournament(tournamentName, teamNames, { from: accounts[0] });
      const tournamentAddress = tournamentContract.logs[0].args.tournamentContract;
      this.redirect = tournamentAddress;
    }

    @action
    openBettingWindow = async () => {
        const { accounts, connect } = this._rootStore.providerStore;
        connect();
        if(!this.contract) {
            return;
        } 
        const response = await this.contract.openBettingWindow({ from: accounts[0] });
        console.log(response);
        this.getTimeLeft();
    }

    @action
    startTournament = async () => {
        const { accounts, connect } = this._rootStore.providerStore;
        connect();
        if(!this.contract) {
            return;
        } 
        await this.contract.startTournament({ from: accounts[0] });
        const participants = await this.getParticipants();
        const tournamentName = await this.getTournamentName();
        this.initTournament(participants, tournamentName)
    }
};



export default GameStore;