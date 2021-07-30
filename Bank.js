module.exports = function Bank(name="Bank", color="black") {
	this.name = name;
	this.color = color;
	this.position = 0;
	this.creditor = -1;
	this.bidding = true;
	this.human = true;
	this.geldMenge = 0;
	this.zinsenLotto = 0;
	this.derivateBank = 0;
	this.anleihenBank = 0;
	this.index = 0;

	this.pay = function (amount, creditor) {
		if (amount <= this.money) {
			this.zinsenLotto -= amount;

			updateMoney();

			var c = player[creditor];
			if (c.money < 0) {
				if (c.verfuegbareHypothek < c.sumKredit - c.money) {
					sozialHilfe(creditor);
				}
				game.kreditAufnehmen(-c.money, creditor);
			}

			return true;
		} else {
			this.zinsenLotto -= amount;
			this.creditor = creditor;

			if (this.zinsenLotto < 0) {
				this.derivateEmittieren(-this.zinsenLotto);
			}

			updateMoney();

			return false;
		}
	};

	this.derivateEmittieren = function (amount=80000) {
		this.derivateBank += Math.floor(1.25*amount);
		this.zinsenLotto += amount;
		this.geldMenge += amount;

		updateMoney();
	};

	this.buyAnleihen = function (amount) {
		this.anleihenBank += amount;

		updateMoney();
		//this.zinsenLotto -= amount;
	};
}