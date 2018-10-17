import EventEmitter from 'events';

class GameBracket extends EventEmitter {
    constructor(game) {
        super();
        Object.assign(this, {...game});
    }

    get getWinner() {
        if (!this.sides.home.score || !this.sides.visitor.score) {
            return null;
        }
        const homeScore = this.sides.home.score.score;
        const visitorScore = this.sides.visitor.score.score;
        if (homeScore === visitorScore)  {
            return null;
        }
        if (homeScore > visitorScore) {
            console.log('ar')
            this.emit('gameWinner', { gameId: this.id , team: this.sides.home.team });
            return this.sides.home.team
        }
        console.log('er')
        this.emit('gameWinner', { gameId: this.id, team: this.sides.visitor.team });
        return this.sides.visitor.team;
    }

    setTournamentWinner = (winner) => {
        if (!this.championship) {
            throw new Error('This is not a championship game');
        }
        
        this.tournamentChampion = winner;
    }

    setHomeScore = (value) => {
        if (value) {
            this.sides.home.score = { score: parseInt(value, 10) }
        }
    }

    setVisitorScore = (value) => {
        if (value) {
            this.sides.visitor.score = { score: parseInt(value, 10) }
        }
    }

    setScore = (home, visitor) => {
        this.setHomeScore(home);
        this.setVisitorScore(visitor);
        this.getWinner;
    }

    setHomeWinner = (winner) => {
        if (!this.winnersBracket) {
            return;
        }
        this.sides.home = { seed: {...this.sides.home.seed}, score: { score: 0 }, team: winner }
    }

    setVisitorWinner = (winner) => {
        if(!this.winnersBracket) {
            return;
        }
        this.sides.visitor = {
            seed: {...this.sides.visitor.seed},
            score: { score: 0 },
            team: winner
        }
    }
}

export default GameBracket;