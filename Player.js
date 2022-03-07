module.exports = class Player {
	#game;
	constructor(game, name, color) {
		this.name = name;
		this.color = color;
		this.position = 0;
		this.money = 0;
		this.creditor = -1;
		this.bidding = true;
		this.human = true;
		this.gesamtHypothek = 0;
		this.verfuegbareHypothek = 0;
		this.sumKredit = 0; 
		this.anleihen = 0;
		this.derivate = 0;
		this.AI = null;
		this.yacht = 0
		this.auto = 0
		this.motorrad = 0
		this.active = true
		this.#game = game;
	}
	

	pay = function (amount, creditor) {
		if (amount <= this.money) {
			this.money -= amount;

			this.update();

			if (creditor == 0) {
				if (this.#game.meineBank.zinsenLotto < 0) {
					this.#game.meineBank.derivateEmittieren(-this.#game.meineBank.zinsenLotto);
				}
			}
			else {
				var c = this.#game.player[creditor];
				if (c==undefined) return true;
				if (c.money < 0) {
					if (c.verfuegbareHypothek < c.sumKredit - c.money) {
						this.#game.sozialHilfe(creditor);
					}
				}
			}

			return true;
		} else {
			this.money -= amount;
			this.creditor = creditor;

			var i = this.#game.player.indexOf(this);
			if (this.money < 0) {
				if (this.verfuegbareHypothek < this.sumKredit - this.money) {
					this.#game.sozialHilfe(i);
				}
			}

			this.update();

			return false;
		}
	};

	buyDerivate = function (amount) {
		if (this.money < amount * this.#game.meineBank.derivateKurs || this.#game.meineBank.derivate < amount) {
			return false;
		}
		this.derivate += amount;
		this.#game.meineBank.derivate -= amount;
		this.money -= amount * this.#game.meineBank.derivateKurs;
		this.update();
	};

	buyAnleihen = function (amount) {
		this.anleihen += amount;
		this.money -= amount;
		this.update();
	};

	update = function() {
		var sq;
		this.gesamtHypothek = 0;

		for (var i = 0; i < 12; i++) {
			sq = this.#game.square[i];
			if (this.#game.player[sq.owner] == this) {
				if(!sq.mortgage)
					this.gesamtHypothek += sq.price * (1 + sq.house)
			}
		}

		this.verfuegbareHypothek = this.gesamtHypothek + this.anleihen + this.derivate;
		this.#game.updateMoney();
	};

	kreditAufnehmen = function (amount) {
		if (this.sumKredit + amount <= this.verfuegbareHypothek) {
			this.money += amount;
			this.sumKredit += amount;

			this.#game.meineBank.geldMenge += amount;

			this.#game.updateMoney();

			this.#game.addAlert(this.name + " hat einen Kredit in Höhe von " + amount + " aufgenommen.");

			return true;
		} else {
			return false;
		}
	}

	kreditTilgen = function (amount) {
		if (amount <= this.money) {
			this.money -= amount;
			this.sumKredit -= amount;

			this.#game.meineBank.geldMenge -= amount;

			this.#game.updateMoney();

			return true;
		} else {
			return false;;
		}
	}
}