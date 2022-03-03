exports.payplayer = function payplayer(game, position, amount) {
	var receiver = game.turn + position;
	var nPlayer = game.pcount
	
	if (receiver < 0) {
		receiver = nPlayer;
	}
	if (receiver > nPlayer) {
		receiver = 1;
	}

	var p = game.player[game.turn];

	game.player[receiver].money += amount;

	p.pay(amount, receiver);

	if (amount < 0) {
		game.addAlert(p.name + " hat " + (-amount) + " von " + game.player[receiver].name + " erhalten.");
	} else {
		game.addAlert(p.name + " hat " + amount + " an " + game.player[receiver].name + " gezahlt.");
	}

}

exports.sellRichest = function sellRichest(game, amount) {
	
	var richest;
	var idx = 0;
	var money = -1e6;
	for (var i = 1; i <= game.pcount; i++) {
		p = game.player[i];
		if (p.money >= money) {
			richest = p;
			money = p.money;
			idx = i;
		}
	}

	var p = game.player[game.turn];

	p.money += amount;

	richest.pay(amount, idx);

	game.addAlert(richest.name + " hat " + amount + " an " + p.name + " gezahlt.");
}

exports.sellPoorest = function sellPoorest(game, amount) {
	
	var poorest;
	var idx = 0;
	var money = 1e6;
	for (var i = 1; i <= pcount; i++) {
		p = game.player[i];
		if (p.money <= money) {
			poorest = p;
			money = p.money;
			idx = i;
		}
	}

	var p = game.player[turn];

	p.money += amount;

	poorest.pay(amount, idx);

	game.addAlert(poorest.name + " hat " + amount + " an " + p.name + "gezahlt.");

	return poorest.index
}

exports.receiveFromBank = function receiveFromBank(game, amount, key) {
	var p = game.player[key];
	p.money += amount
	game.meineBank.derivateEmittieren(amount);
	game.meineBank.zinsenLotto -= amount;
}

exports.receiveBankguthaben = function receiveBankguthaben(game) {
  var p = game.player[game.turn];
	p.money += game.meineBank.zinsenLotto;
	game.meineBank.zinsenLotto = 0;
}

exports.sellHouse = function sellHouse(game, index) {
	sq = game.square[index];
	p = game.player[sq.owner];

	sq.house--;
	game.addAlert(p.name + " hat ein Haus in der " + sq.name + " verkauft.");

	p.money += sq.houseprice;
	game.meineBank.pay(sq.houseprice, sq.owner);
	game.updateOwned();
	game.updateMoney();
}

exports.buy = function buy(game) {
	var p = game.player[turn];
	var property = game.square[p.position];
	var cost = property.price;

	if (p.money >= cost) {
		p.pay(cost, 0);

		property.owner = turn;
		game.updateMoney();
		game.addAlert(p.name + " hat " + property.name + " für " + property.houseprice + " gekauft.");

		game.updateOwned();
		p.update();

    	if (p.human) game.SOCKET_LIST[turn].emit('show', "#landed", false);

	} else {
		game.popup("<p>" + p.name + ", du brauchst weitere " + (property.price - p.money) + " um " + property.name + " zu kaufen.</p>");
	}
}

exports.mortgage = function mortgage(game, index) {
	var sq = game.square[index];
	var p = game.player[sq.owner];

	if (sq.mortgage) {
		return false;
	}

	var mortgagePrice = sq.price;

	sq.mortgage = true;
	p.money += mortgagePrice;

  var value = "Hypothek zurückzahlen für " + mortgagePrice;
  var title = "Hypothek auf " + sq.name + " zurückzahlen für " + mortgagePrice + ".";

  	if (p.human) SOCKET_LIST[turn].emit('changeButton', "mortgagebutton", value, title);

	game.addAlert(p.name + " hat eine Hypothek auf " + sq.name + " für " + mortgagePrice + " aufgenommen.");
	game.updateOwned();
	game.updateMoney();

	return true;
}

exports.handleOffer = function handleOffer(game){
	var receiver = game.tradeObj.initiator.index;
	if (receiver == 0) {
		var money;
		var initiator;
		var recipient;

		money = game.tradeObj.money;
		anleihen = game.tradeObj.anleihen;
		derivate = game.tradeObj.derivate;
		initiator = game.meineBank;
		recipient = game.player[game.tradeObj.recipient.index];

		if (game.tradeObj.assets.length > 0) {
			game.popup("<p>Es können keine Fahrzeuge oder Yachten an die Bank verkauft werdem.</p>", key=receiver);
			return;
		}
		
		if (money + anleihen + (derivate * initiator.derivateKurs) != 0)
			return;

		// Exchange money.
		if (money > 0) {
			initiator.pay(money, recipient.index);
    		recipient.money += money;

			game.addAlert(recipient.name + " hat " + money + " von " + initiator.name + " erhalten.");
		} else if (money < 0) {
			recipient.pay(-money, initiator.index);
    		initiator.zinsenLotto -= money;

			game.addAlert(initiator.name + " hat " + (-money) + " von " + recipient.name + " erhalten.");
		}

		//stock exchange
		if (anleihen > 0) {
			initiator.anleihenBank -= anleihen;
			recipient.anleihen += anleihen;

			game.addAlert(recipient.name + " hat Anleihen im Wert von " + anleihen + " von " + initiator.name + " erhalten.");
		} else if (anleihen < 0) {
			initiator.anleihenBank -= anleihen;
			recipient.anleihen += anleihen;

			game.addAlert(initiator.name + " hat Anleihen im Wert von " + (-anleihen) + " von " + recipient.name + " erhalten.");
		}

		if (derivate > 0) {
			initiator.derivateBank -= derivate;
			recipient.derivate += derivate;

			addAlert(recipient.name + " hat Derivate im Wert von " + derivate + " von " + initiator.name + " erhalten.");
		} else if (derivate < 0) {
			initiator.derivateBank -= derivate;
			recipient.derivate += derivate;

			game.addAlert(initiator.name + " hat Anleihen im Wert von " + (-derivate) + " von " + recipient.name + " erhalten.");
		}

		game.updateOwned()
		game.updateMoney()
		return;
	}
	else if (!game.player[receiver].human) {
		var result = game.player[receiver].AI.acceptTrade(game.tradeObj);
		if (result === false) {
			return;
		} else if (result === true) {
			var money;
			var initiator;
			var recipient;

			money = game.tradeObj.money;
			anleihen = game.tradeObj.anleihen;
			derivate = game.tradeObj.derivate;
			initiator = game.player[receiver];
			recipient = game.player[game.tradeObj.recipient.index];
			tradeAssets = game.tradeObj.assets;

			//Exchange properties
			for (var i = 0; i < 12; i++) {
				
				if (game.tradeObj.property[i] === 1) {
					game.square[i].owner = recipient.index;
					game.addAlert(recipient.name + " hat " + game.square[i].name + " von " + initiator.name + " erhalten.");
				} else if (game.tradeObj.property[i] === -1) {
					game.square[i].owner = initiator.index;
					game.addAlert(initiator.name + " hat " + game.square[i].name + " von " + recipient.name + " erhalten.");
				}
			}

			//Exchange assets
			if (tradeAssets.length == 3) {
				recipient.motorrad += tradeAssets[0]
				initiator.motorrad -= tradeAssets[0]
				if (tradeAssets[0] > 0) {
					game.addAlert(recipient.name + " hat Motorrad von " + initiator.name + " erhalten.");
				}
				else if (tradeAssets[0] < 0) {
					game.addAlert(initiator.name + " hat Motorrad von " + recipient.name + " erhalten.");
				}
				recipient.auto += tradeAssets[1]
				initiator.auto -= tradeAssets[1]
				if (tradeAssets[1] > 0) {
					game.addAlert(recipient.name + " hat Auto von " + initiator.name + " erhalten.");
				}
				else if (tradeAssets[1] < 0) {
					game.addAlert(initiator.name + " hat Auto von " + recipient.name + " erhalten.");
				}
				recipient.yacht += tradeAssets[2]
				initiator.yacht -= tradeAssets[2]
				if (tradeAssets[2] > 0) {
					game.addAlert(recipient.name + " hat Yacht von " + initiator.name + " erhalten.");
				}
				else if (tradeAssets[2] < 0) {
					game.addAlert(initiator.name + " hat Yacht von " + recipient.name + " erhalten.");
				}
			}

			// Exchange money.
			if (money > 0) {
				initiator.pay(money, recipient.index);
				recipient.money += money;

				game.addAlert(recipient.name + " hat " + money + " von " + initiator.name + " erhalten.");
			} else if (money < 0) {
				recipient.pay(-money, initiator.index);
				initiator.money -= money;

				game.addAlert(initiator.name + " hat " + (-money) + " von " + recipient.name + " erhalten.");
			}

			//stock exchange
			if (anleihen > 0) {
				initiator.anleihen -= anleihen;
				recipient.anleihen += anleihen;

				game.addAlert(recipient.name + " hat Anleihen im Wert von " + anleihen + " von " + initiator.name + " erhalten.");
			} else if (anleihen < 0) {
				initiator.anleihen -= anleihen;
				recipient.anleihen += anleihen;

				game.addAlert(initiator.name + " hat Anleihen im Wert von " + (-anleihen) + " von " + recipient.name + " erhalten.");
			}

			if (derivate > 0) {
				initiator.derivate -= derivate;
				recipient.derivate += derivate;

				game.addAlert(recipient.name + " hat Derivate im Wert von " + derivate + " von " + initiator.name + " erhalten.");
			} else if (derivate < 0) {
				initiator.derivate -= derivate;
				recipient.derivate += derivate;

				game.addAlert(initiator.name + " hat Derivate im Wert von " + (-derivate) + " von " + recipient.name + " erhalten.");
			}

			game.updateOwned()
			game.updateMoney()
			return;
		} else {
			game.tradeObj = result;
			game.SOCKET_LIST[game.tradeObj.initiator.index].emit('receiveOffer', game.tradeObj);
		}
		return;
	}
    game.SOCKET_LIST[receiver].emit('receiveOffer', game.tradeObj);
}

exports.bid = function(game) {
	
	while (true) {
		game.currentbidder++;

		if (game.currentbidder > game.pcount) {
			game.currentbidder -= game.pcount;
		}
		if (game.currentbidder == game.highestbidder) {
			game.finalizeAuction();
			return;
		} else if (game.player[game.currentbidder].bidding) {
			break;
		}

	}
	if (game.player[game.currentbidder].human) {
		game.SOCKET_LIST[game.currentbidder].emit("auction", game.auctionproperty, game.player, game.square, game.highestbidder, game.highestbid)
	} else {
		game.player[game.currentbidder].AI.bid(game.auctionproperty, game.highestbid);
	}
  }