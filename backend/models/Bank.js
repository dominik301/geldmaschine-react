var Player = require('./Player');
module.exports = class Bank extends Player {
	#game;
	constructor(game, name="Bank", color="black") {
		super(game,name,color);
		this.bidding = false;
		this.human = false;
		this.geldMenge = 0;
		this.zinsenLotto = 0;
		this.derivateKurs = 1.05;
		this.index = 0;	
		this.#game = game; 
	}

	pay = function (amount, creditor) {
		if (amount <= this.money) {
			this.zinsenLotto -= amount;

			this.#game.updateMoney();

			var c = this.#game.player[creditor];
			if (c.money < 0) {
				if (c.verfuegbareHypothek < c.sumKredit - c.money) {
					this.#game.sozialHilfe(creditor);
				}
			}

			return true;
		} else {
			this.zinsenLotto -= amount;
			this.creditor = creditor;

			if (this.zinsenLotto < 0) {
				this.derivateEmittieren(-this.zinsenLotto);
			}

			this.#game.updateMoney();

			return false;
		}
	};

	derivateEmittieren = function (amount=80000) {
		this.derivate += Math.floor(1.25*amount);
		this.zinsenLotto += amount;
		this.geldMenge += amount;

		this.#game.updateMoney();
	};

	buyAnleihen = function (amount) {
		this.anleihen += amount;

		this.#game.updateMoney();
		//this.zinsenLotto -= amount;
	};
}