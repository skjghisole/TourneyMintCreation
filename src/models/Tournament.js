import EventEmitter from 'events';
import { sha3_256 } from 'js-sha3';
import GameBracket from './GameBracket';

class Tournament extends EventEmitter{
	constructor(participants, name) {
		super();
		this.name = name;
		this.participants = participants;
		this._brackets = []
        this._gameBracket =  {}
	}

  get winnerBrackets() {
    return this._brackets.filter(winnerBracket => winnerBracket.winnersBracket);
  }

  get championshipBracket() {
    return this._brackets.filter(bracket => bracket.championship)[0];
  }

  get tournamentChampion() {
    if(this._gameBracket.championship) {
      return this._gameBracket.tournamentChampion;
    }
  }

  _initializeBracketGame() {
    const { participants } = this; 
    const homeTeams = participants.filter((participant, index) => index % 2 === 0);
    const visitorTeams = participants.filter((participant) => !homeTeams.includes(participant));
    let brackets = [];

    if(participants.length === 2) {
        let i = 0;
        const bracketId = sha3_256(`${homeTeams[i]}|${visitorTeams[i]}|${i}`).slice(0, 10);
        const gameBracket = new GameBracket({
            id: bracketId,
            name: `Bracket ${i+1}`,
            winnersBracket: true,
            championship: true,
            scheduled: new Date(),
            sides:{
                home:{
                    score: {
                        score: 0
                    },
                    team: {
                        id: sha3_256(`${homeTeams[i]}`).slice(0, 10),
                        name: homeTeams[i]
                    },
                },
                visitor:{
                    score: {
                        score: 0
                    },
                    team: {
                        id: sha3_256(`${visitorTeams[i]}`).slice(0, 10),
                        name: visitorTeams[i]
                    }
                }
            }
        });
        this._brackets = [gameBracket];
        this._gameBracket = gameBracket;
        return;
    }

    for (let i = 0; i < participants.length/2; i++) {
        const bracketId = sha3_256(`${homeTeams[i]}|${visitorTeams[i]}|${i}`).slice(0, 10);
        const gameBracket = new GameBracket({
            id: bracketId,
            name: `Bracket ${i+1}`,
            scheduled: new Date(),
            sides:{
                home:{
                    score: {
                        score: 0
                    },
                    team: {
                        id: sha3_256(`${homeTeams[i]}`).slice(0, 10),
                        name: homeTeams[i]
                    },
                },
                visitor:{
                    score: {
                        score: 0
                    },
                    team: {
                        id: sha3_256(`${visitorTeams[i]}`).slice(0, 10),
                        name: visitorTeams[i]
                    }
                }
            }
        })
        brackets.push(gameBracket);
    }
    this._brackets = brackets;
    return this._constructBracket(this._brackets);
  }

  _constructBracket(brackets) {
    const winnerBrackets = [];
    const { _brackets } = this;
    const evenBrackets = brackets.filter((bracket, index) => index % 2 === 0);
    const oddBrackets = brackets.filter(bracket => !evenBrackets.includes(bracket));
    for (let i=0; i < brackets.length/2; i++) {
        let bracketId = sha3_256(evenBrackets[i].id.concat(oddBrackets[i].id)).slice(0, 10);
        const gameBracket = new GameBracket({
            id: bracketId,
            winnersBracket: true,
            championship: brackets.length === 2,
            name: `Winners for 1-${i+1}`,
            scheduled: new Date(),
            bracketLabel: `B${i+1}`,
            seedTeams: [evenBrackets[i].id, oddBrackets[i].id],
            homeSeed: evenBrackets[i].id,
            visitorSeed: oddBrackets[i].id,
            sides:{
                home: {
                    seed: {
                        rank: 1,
                        sourceGame: evenBrackets[i].id
                    }
                },
                visitor: {
                    seed: {
                        rank: 1,
                        sourceGame: oddBrackets[i].id
                    }
                }
            }
        })
        winnerBrackets.push(gameBracket);
    }

    if (winnerBrackets.length === 0) {
        throw new Error('There is something wrong with the construction of Brackets')
    } else if (winnerBrackets.length === 1) {
        _brackets.push(new GameBracket({...winnerBrackets.shift(), tournamentChampion: null}));
        return this.mergeBrackets(_brackets);
    } else if (winnerBrackets.length > 1) {
        winnerBrackets.forEach(bracket => {
            if (_brackets.includes(bracket)) {
                return;
            }
            _brackets.push(bracket);
        });
        return this._constructBracket(winnerBrackets);
        }
	}

  mergeBrackets(brackets) {
    const bracketsClone = brackets;
    bracketsClone.forEach(bracket => {
        if (bracket.winnersBracket) {
            const homeSource = bracket.sides.home.seed.sourceGame;
            const visitorSource = bracket.sides.visitor.seed.sourceGame;
            if(typeof homeSource === 'string') {
                bracket.sides.home.seed.sourceGame = bracketsClone.find(b => b.id === homeSource);
            } 
            if(typeof visitorSource === 'string') {
                bracket.sides.visitor.seed.sourceGame = bracketsClone.find(b => b.id === visitorSource);
            }
        }
    });
    const gameBracket = bracketsClone.find(b => b.championship);
    this._gameBracket = gameBracket;
  }

  get gameBracket() {
  	return this._gameBracket;
  }

  _listenGames() {
    const bracketsClone = this._brackets;
    bracketsClone.forEach(bracket => 
        bracket.on('gameWinner', (res) => { 
          const { winnerBrackets, championshipBracket } = this;
          if (winnerBrackets.length > 0) {
              if (championshipBracket.id === res.gameId) {
                championshipBracket.setTournamentWinner(res.team);
                this.emit('tournamentChampion', res.team);
                return;
              }
              const game = winnerBrackets.filter(b => !!b.seedTeams.includes(res.gameId))[0]
              if(game.homeSeed === res.gameId) {
                  game.setHomeWinner(res.team)
                  this.mergeBrackets(bracketsClone);
              } else if(game.visitorSeed === res.gameId) {
                  game.setVisitorWinner(res.team);
                  this.mergeBrackets(bracketsClone);
              }
          }
        })
    );
   }
}

export default Tournament;