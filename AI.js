// The purpose of this AI is not to be a relistic opponant, but to give an example of a vaild AI player.
module.exports = function AITest(p) {
	this.alertList = "";

	// This variable is static, it is not related to each instance.
	this.constructor.count++;

	p.name = "AI Test " + this.constructor.count;

	// Decide whether to buy a property the AI landed on.
	// Return: boolean (true to buy).
	// Arguments:
	// index: the property's index (0-39).
	this.buyProperty = function(index) {
		console.log("buyProperty");
		var s = square[index];

		if (p.money > s.price) {
			return true;
		} else {
			return false;
		}

	}

	// Determine the response to an offered trade.
	// Return: boolean/instanceof Trade: a valid Trade object to counter offer (with the AI as the recipient); false to decline; true to accept.
	// Arguments:
	// tradeObj: the proposed trade, an instanceof Trade, has the AI as the recipient.
	this.acceptTrade = function(tradeObj) {
		console.log("acceptTrade");

		var tradeValue = 0;
		var money = tradeObj.getMoney();
		var initiator = tradeObj.getInitiator();
		var recipient = tradeObj.getRecipient();
		var property = [];

		tradeValue += money;

		for (var i = 0; i < 12; i++) {
			property[i] = tradeObj.getProperty(i);
			tradeValue += tradeObj.getProperty(i) * square[i].price * (square[i].mortgage ? 0.5 : 1);
		}

		tradeValue += tradeObj.derivate;
		tradeValue += tradeObj.anleihen;

		var proposedMoney = -25 - tradeValue + money;
		var condition = proposedMoney < 0 ? initiator.money > -proposedMoney : recipient.money > proposedMoney;
		if (tradeValue < 0) {
			return true;
		} else if (tradeValue <= 50 && condition) {
			var reversedTradeProperty = [];
			// Ensure that some properties are selected.
			for (var i = 0; i < 12; i++) {
				reversedTradeProperty[i] = -tradeObj.property[i];
			}
            var Trade = require('./Trade.js');
			return new Trade(recipient, initiator, -proposedMoney, reversedTradeProperty, -tradeObj.anleihen, -tradeObj.derivate);
		}

		return false;
	}

	// This function is called at the beginning of the AI's turn, before any dice are rolled. The purpose is to allow the AI to manage property and/or initiate trades.
	// Return: boolean: Must return true if and only if the AI proposed a trade.
	this.beforeTurn = function() {
		console.log("beforeTurn");
		var s;

		// Buy houses.
		for (var i = 0; i < 12; i++) {
			s = square[i];

			if (s.owner === p.index) {

				if (p.money > s.houseprice) {
					buyHouse(i);
				}
			}
		}

		// Unmortgage property
		for (var i = 11; i >= 0; i--) {
			s = square[i];

			if (s.owner === p.index && s.mortgage && p.money > s.price) {
				unmortgage(i);
			}
		}

		return false;
	}


	// This function is called every time the AI lands on a square. The purpose is to allow the AI to manage property and/or initiate trades.
	// Return: boolean: Must return true if and only if the AI proposed a trade.
	this.onLand = function() {
		console.log("onLand");
		return false;
	}

	// Mortgage enough properties to pay debt.
	// Return: void: don't return anything, just call the functions mortgage()/sellhouse()
	this.payDebt = function() {
		console.log("payDebt");
		
		if (p.money < 0) {
			if (p.verfuegbareHypothek < p.sumKredit - p.money) {
				sozialHilfe(p.index);
			}
			game.kreditAufnehmen(-p.money, 0);
		}

	}

	// Determine what to bid during an auction.
	// Return: integer: -1 for exit auction, 0 for pass, a positive value for the bid.
	this.bid = function(property, currentBid) {
		console.log("bid");
		var bid;

		bid = currentBid + Math.round(Math.random() * 20 + 10);

		if (p.money < bid || bid > square[property].price * 1.5) {
			console.log("AI passes.")
		} else {
			game.highestbidder = p.index;
			game.highestbid = bid;
		}

		require('./transactionFunctions').bid();
	}
}