exports.payplayer = function payplayer(position, amount) {
	var receiver = turn + position;
	var nPlayer = pcount
	
	if (receiver < 0) {
		receiver = nPlayer;
	}
	if (receiver > nPlayer) {
		receiver = 1;
	}

	var p = player[turn];

	player[receiver].money += amount;

	p.pay(amount, receiver);

	if (amount < 0) {
		addAlert(p.name + " hat " + (-amount) + " von " + player[receiver].name + " erhalten.");
	} else {
		addAlert(p.name + " hat " + amount + " an " + player[receiver].name + " gezahlt.");
	}

}

exports.sellRichest = function sellRichest(amount) {
	
	var richest;
	var idx = 0;
	var money = -1e6;
	for (var i = 1; i <= pcount; i++) {
		p = player[i];
		if (p.money >= money) {
			richest = p;
			money = p.money;
			idx = i;
		}
	}

	var p = player[turn];

	p.money += amount;

	richest.pay(amount, idx);

	addAlert(richest.name + " hat " + amount + " an " + p.name + " gezahlt.");
}

exports.sellPoorest = function sellPoorest(amount) {
	
	var poorest;
	var idx = 0;
	var money = 1e6;
	for (var i = 1; i <= pcount; i++) {
		p = player[i];
		if (p.money <= money) {
			poorest = p;
			money = p.money;
			idx = i;
		}
	}

	var p = player[turn];

	p.money += amount;

	poorest.pay(amount, idx);

	addAlert(poorest.name + " hat " + amount + " an " + p.name + "gezahlt.");
}

exports.receiveFromBank = function receiveFromBank(amount, key=turn) {
	var p = player[key];
	p.money += amount
	meineBank.derivateEmittieren(amount);
	meineBank.zinsenLotto -= amount;
}

exports.receiveBankguthaben = function receiveBankguthaben() {
  var p = player[turn];
	p.money += meineBank.zinsenLotto;
	meineBank.zinsenLotto = 0;
}

exports.sellHouse = function sellHouse(index) {
	sq = square[index];
	p = player[sq.owner];

	sq.house--;
	addAlert(p.name + " hat ein Haus in der " + sq.name + " verkauft.");

	p.money += sq.houseprice;
	meineBank.pay(sq.houseprice, sq.owner);
	updateOwned();
	updateMoney();
}

exports.buy = function buy() {
	var p = player[turn];
	var property = square[p.position];
	var cost = property.price;

	if (p.money >= cost) {
		p.pay(cost, 0);

		property.owner = turn;
		updateMoney();
		addAlert(p.name + " hat " + property.name + " für " + property.houseprice + " gekauft.");

		updateOwned();
		p.update();

    	if (p.human) SOCKET_LIST[turn].emit('show', "#landed", false);

	} else {
		popup("<p>" + p.name + ", du brauchst weitere " + (property.price - p.money) + " um " + property.name + " zu kaufen.</p>");
	}
}

exports.mortgage = function mortgage(index) {
	var sq = square[index];
	var p = player[sq.owner];

	if (sq.mortgage) {
		return false;
	}

	var mortgagePrice = sq.price;

	sq.mortgage = true;
	p.money += mortgagePrice;

  var value = "Hypothek zurückzahlen für " + mortgagePrice;
  var title = "Hypothek auf " + sq.name + " zurückzahlen für " + mortgagePrice + ".";

  	if (p.human) SOCKET_LIST[turn].emit('changeButton', "mortgagebutton", value, title);

	addAlert(p.name + " hat eine Hypothek auf " + sq.name + " für " + mortgagePrice + " aufgenommen.");
	updateOwned();
	updateMoney();

	return true;
}

exports.handleOffer = function handleOffer(){
	var receiver = game.tradeObj.initiator.index;
	if (receiver == 0) {
		var money;
		var initiator;
		var recipient;

		money = game.tradeObj.money;
		anleihen = game.tradeObj.anleihen;
		derivate = game.tradeObj.derivate;
		initiator = meineBank;
		recipient = player[game.tradeObj.recipient.index];

		if (money + anleihen + derivate != 0)
			return;

		// Exchange money.
		if (money > 0) {
			initiator.pay(money, recipient.index);
    		recipient.money += money;

			addAlert(recipient.name + " hat " + money + " von " + initiator.name + " erhalten.");
		} else if (money < 0) {
			recipient.pay(-money, initiator.index);
    		initiator.zinsenLotto -= money;

			addAlert(initiator.name + " hat " + (-money) + " von " + recipient.name + " erhalten.");
		}

		//stock exchange
		if (anleihen > 0) {
			initiator.anleihenBank -= anleihen;
			recipient.anleihen += anleihen;

			addAlert(recipient.name + " hat Anleihen im Wert von " + anleihen + " von " + initiator.name + " erhalten.");
		} else if (anleihen < 0) {
			initiator.anleihenBank -= anleihen;
			recipient.anleihen += anleihen;

			addAlert(initiator.name + " hat Anleihen im Wert von " + (-anleihen) + " von " + recipient.name + " erhalten.");
		}

		if (derivate > 0) {
			initiator.derivateBank -= derivate;
			recipient.derivate += derivate;

			addAlert(recipient.name + " hat Derivate im Wert von " + derivate + " von " + initiator.name + " erhalten.");
		} else if (derivate < 0) {
			initiator.derivateBank -= derivate;
			recipient.derivate += derivate;

			addAlert(initiator.name + " hat Anleihen im Wert von " + (-derivate) + " von " + recipient.name + " erhalten.");
		}

		updateOwned()
		updateMoney()
		return;
	}
	else if (!player[receiver].human) {
		var result = player[receiver].AI.acceptTrade(game.tradeObj);
		if (result === false) {
			return;
		} else if (result === true) {
			var money;
			var initiator;
			var recipient;

			money = game.tradeObj.money;
			anleihen = game.tradeObj.anleihen;
			derivate = game.tradeObj.derivate;
			initiator = player[receiver];
			recipient = player[game.tradeObj.recipient.index];

			//Exchange properties
			for (var i = 0; i < 12; i++) {

				if (game.tradeObj.property[i] === 1) {
					square[i].owner = recipient.index;
					addAlert(recipient.name + " hat " + square[i].name + " von " + initiator.name + " erhalten.");
				} else if (game.tradeObj.property[i] === -1) {
					square[i].owner = initiator.index;
					addAlert(initiator.name + " hat " + square[i].name + " von " + recipient.name + " erhalten.");
				}
		
			}

			// Exchange money.
			if (money > 0) {
				initiator.pay(money, recipient.index);
				recipient.money += money;

				addAlert(recipient.name + " hat " + money + " von " + initiator.name + " erhalten.");
			} else if (money < 0) {
				recipient.pay(-money, initiator.index);
				initiator.money -= money;

				addAlert(initiator.name + " hat " + (-money) + " von " + recipient.name + " erhalten.");
			}

			//stock exchange
			if (anleihen > 0) {
				initiator.anleihen -= anleihen;
				recipient.anleihen += anleihen;

				addAlert(recipient.name + " hat Anleihen im Wert von " + anleihen + " von " + initiator.name + " erhalten.");
			} else if (anleihen < 0) {
				initiator.anleihen -= anleihen;
				recipient.anleihen += anleihen;

				addAlert(initiator.name + " hat Anleihen im Wert von " + (-anleihen) + " von " + recipient.name + " erhalten.");
			}

			if (derivate > 0) {
				initiator.derivate -= derivate;
				recipient.derivate += derivate;

				addAlert(recipient.name + " hat Derivate im Wert von " + derivate + " von " + initiator.name + " erhalten.");
			} else if (derivate < 0) {
				initiator.derivate -= derivate;
				recipient.derivate += derivate;

				addAlert(initiator.name + " hat Anleihen im Wert von " + (-derivate) + " von " + recipient.name + " erhalten.");
			}

			updateOwned()
			updateMoney()
			return;
		} else {
			game.tradeObj = result;
			SOCKET_LIST[game.tradeObj.initiator.index].emit('receiveOffer', game.tradeObj);
		}
		return;
	}
    SOCKET_LIST[receiver].emit('receiveOffer', game.tradeObj);
}

exports.bid = function() {
	
	while (true) {
		game.currentbidder++;

		if (game.currentbidder > pcount) {
			game.currentbidder -= pcount;
		}
		if (game.currentbidder == game.highestbidder) {
			game.finalizeAuction();
			return;
		} else if (player[game.currentbidder].bidding) {
			break;
		}

	}
	if (player[game.currentbidder].human) {
		SOCKET_LIST[game.currentbidder].emit("auction", game.auctionproperty, player, square, game.highestbidder, game.highestbid)
	} else {
		player[game.currentbidder].AI.bid(game.auctionproperty, game.highestbid);
	}
  }