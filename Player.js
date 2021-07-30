module.exports = function Player(name, color) {
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

	this.pay = function (amount, creditor) {
		if (amount <= this.money) {
			this.money -= amount;

			this.update();

			if (creditor == 0) {
				if (meineBank.zinsenLotto < 0) {
					meineBank.derivateEmittieren(-meineBank.zinsenLotto);
				}
			}
			else {
				var c = player[creditor];
				if (c==undefined) return true;
				if (c.money < 0) {
					if (c.verfuegbareHypothek < c.sumKredit - c.money) {
						sozialHilfe(creditor);
					}
					game.kreditAufnehmen(-c.money, creditor);
				}
			}

			return true;
		} else {
			this.money -= amount;
			this.creditor = creditor;

			var i = player.indexOf(this);
			if (this.money < 0) {
				if (this.verfuegbareHypothek < this.sumKredit - this.money) {
					sozialHilfe(i);
				}
				game.kreditAufnehmen(-this.money, i);
			}

			this.update();

			return false;
		}
	};

	this.buyDerivate = function (amount) {
		if (this.money < amount || meineBank.derivateBank < amount) {
			return false;
		}
		this.derivate += amount;
		meineBank.derivateBank -= amount;
		this.money -= amount;
		this.update();
	};

	this.buyAnleihen = function (amount) {
		this.anleihen += amount;
		this.money -= amount;
		this.update();
	};

	this.update = function() {
		var sq;
		this.gesamtHypothek = 0;

		for (var i = 0; i < 12; i++) {
			sq = square[i];
			if (player[sq.owner] == this) {
				if(!sq.mortgage)
					this.gesamtHypothek += sq.price * (1 + sq.house)
			}
		}

		this.verfuegbareHypothek = this.gesamtHypothek + this.anleihen + this.derivate;
		updateMoney();
	};

	this.kreditAufnehmen = function (amount) {
		if (this.sumKredit + amount <= this.verfuegbareHypothek) {
			this.money += amount;
			this.sumKredit += amount;

			meineBank.geldMenge += amount;

			updateMoney();

			addAlert(this.name + " hat einen Kredit in Höhe von " + amount + " aufgenommen.");

			return true;
		} else {
			return false;
		}
	}

	this.kreditTilgen = function (amount) {
		if (amount <= this.money) {
			this.money -= amount;
			this.sumKredit -= amount;

			meineBank.geldMenge -= amount;

			updateMoney();

			return true;
		} else {
			return false;;
		}
	}
}