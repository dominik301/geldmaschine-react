module.exports = function Bank(game, name="Bank", color="black") {
	this.name = name;
	this.color = color;
	this.position = 0;
	this.creditor = -1;
	this.bidding = false;
	this.human = false;
	this.geldMenge = 0;
	this.zinsenLotto = 0;
	this.derivateBank = 0;
	this.derivateKurs = 1.05;
	this.anleihenBank = 0;
	this.index = 0;

	this.pay = function (amount, creditor) {
		if (amount <= this.money) {
			this.zinsenLotto -= amount;

			game.updateMoney();

			var c = game.player[creditor];
			if (c.money < 0) {
				if (c.verfuegbareHypothek < c.sumKredit - c.money) {
					sozialHilfe(game,creditor);
				}
			}

			return true;
		} else {
			this.zinsenLotto -= amount;
			this.creditor = creditor;

			if (this.zinsenLotto < 0) {
				this.derivateEmittieren(-this.zinsenLotto);
			}

			game.updateMoney();

			return false;
		}
	};

	this.derivateEmittieren = function (amount=80000) {
		this.derivateBank += Math.floor(1.25*amount);
		this.zinsenLotto += amount;
		this.geldMenge += amount;

		game.updateMoney();
	};

	this.buyAnleihen = function (amount) {
		this.anleihenBank += amount;

		game.updateMoney();
		//this.zinsenLotto -= amount;
	};
}