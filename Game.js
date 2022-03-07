module.exports = class Game {
	#die1;
	#areDiceRolled;
	#auctionQueue
	constructor() {
		this.SOCKET_LIST = {};
		this.#areDiceRolled = false;

		this.zinssatz = 5;
		this.dispoZinssatz = 10;

		this.phase = 1;

		this.percent = 0;
		this.discount = 0;

		this.#auctionQueue = [];
		this.highestbidder;
		this.highestbid;
		this.currentbidder = 1;
		this.auctionproperty;

		this.gameRunning = false;
		this.timePassed = false;

		this.chanceIndex = 0;

		this.player = [];
		this.pcount;
		this.turn = 0;
		var Bank = require('./Bank');
		var Staat = require('./Staat');
		this.meinStaat = new Staat();
		this.meineBank = new Bank(this);

		this.square = require('./Square.js').square;
	}

	// Auction functions:
	chooseProperty() {
		this.SOCKET_LIST[this.turn].emit("chooseProperty", this.player, this.square);
	}

	finalizeAuction() {
		var p = this.player[this.highestbidder];
		var sq = this.square[this.auctionproperty];

		if (this.highestbid > 0) {
			p.pay(this.highestbid, 0);
			sq.owner = this.highestbidder;
			this.addAlert(p.name + " hat " + sq.name + " für " + this.highestbid + " ersteigert.");
			this.player[this.turn].money += this.highestbid;
			payeachplayer(this,this.highestbid / 2, "Versteigerung");
		}

		for (var i = 1; i <= pcount; i++) {
			this.player[i].bidding = true;
		}

		play();
	};

	addPropertyToAuctionQueue(propertyIndex) {
		this.#auctionQueue.push(propertyIndex);
	};

	auction() {
		if (this.#auctionQueue.length === 0) {
			return false;
		}

		var index = this.#auctionQueue.shift();

		var s = this.square[index];

		this.auctionproperty = index;
		this.highestbidder = 0;
		this.highestbid = 0;
		this.currentbidder = this.turn + 1;

		if (this.currentbidder > this.pcount) {
			this.currentbidder -= this.pcount;
		}

		if (this.player[this.currentbidder].human) {
			this.SOCKET_LIST[this.currentbidder].emit("auction", this.auctionproperty, this.player, this.square, this.highestbidder, this.highestbid)
		} else {
			this.player[this.currentbidder].AI.bid(this.auctionproperty, this.highestbid);
		}
				
		this.updateMoney();
		return true;
	};


	rollDice() {
		this.#die1 = Math.floor(Math.random() * 6) + 1;
		this.#areDiceRolled = true;
	};

	resetDice() {
		this.#areDiceRolled = false;
	};

	next() {
		if (this.#areDiceRolled) {
			play(this);
		} else {
			this.roll();
		}
	};

	getDie() {
		return this.#die1;
	};

	updateDice() {
		for(var i in this.SOCKET_LIST){
			this.SOCKET_LIST[i].emit('updateDice', this.#die1);
		}
	}

	// Credit functions:

	kreditAufnehmen(amount, key=this.turn) {
		var initiator = this.player[key];
		initiator.update();

		if (initiator.sumKredit + amount > initiator.verfuegbareHypothek) {
			this.popup("<p>" + initiator.name + ", deine verfügbare Hypothek ist geringer als " + amount + ".</p>", key=key);
			return false;
		}

		initiator.kreditAufnehmen(amount);
	}

	kreditTilgen(amount,key=this.turn) {
    	var initiator = this.player[key];

		if (amount > initiator.money) {
			this.popup("<p>" + initiator.name + ", du hast keine " + amount + ".</p>", key=key);
			return false;
		}

		initiator.kreditTilgen(amount);		
	}

	// Bankrupcy functions:


	eliminatePlayer(key=this.turn) {
		var p = this.player[key];
		if (p==undefined) return;

		var isPlayerTurn = key == this.turn;

		for (var i = p.index; i < this.pcount; i++) {
			this.player[i] = this.player[i + 1];
			this.player[i].index = i;

		}

		for (var i = 0; i < 12; i++) {
			if (this.square[i].owner >= p.index) {
				this.square[i].owner--;
			}
		}

		this.pcount--;
		if (key <= this.turn)
			this.turn--;
		if (this.turn == 0) {
			this.turn = this.pcount;
		}

		delete this.SOCKET_LIST[key];
		for (var i = p.index; i < this.pcount+1; i++) {
			if (this.SOCKET_LIST[i+1] == undefined) break;
			this.SOCKET_LIST[i] = this.SOCKET_LIST[i + 1];
			this.SOCKET_LIST[i].emit('setPlayerId', i);
		}	
		delete this.SOCKET_LIST[this.pcount+1];

		this.updateOwned();
		this.updateMoney();

		if (Object.keys(this.SOCKET_LIST).length == 0) {
			this.gameRunning = false;
			this.player = [];
			return;
		}
		/*if (pcount === 2) {
			document.getElementById("stats").style.width = "454px";
		} else if (pcount === 3) {
			document.getElementById("stats").style.width = "686px";
		}*/ //TODO

		if (this.pcount === 1) {
			this.updateMoney();
			this.SOCKET_LIST[this.turn].emit('show', '#control, #board', false);
			this.SOCKET_LIST[this.turn].emit('show', '#refresh', true);

			this.popup("<p>Glückwunsch, " + this.player[1].name + ", du hast das Spiel gewonnen.</p><div>");

		} else if (isPlayerTurn){
			play(this);
		}
	};

	#bankruptcyUnmortgage() {
		var p = this.player[this.turn];

		if (p.creditor === 0) {
			this.eliminatePlayer();
			return;
		}

		var HTML = "<p>" + this.player[p.creditor].name + ", du darfst die Hypothek für eines der folgenden Grundstücke zurückzahlen, indem du darauf klickst. Klicke OK, wenn du fertig bist.</p><table>";
		var price;

		for (var i = 0; i < 12; i++) {
			sq = this.square[i];
			if (sq.owner == p.index && sq.mortgage) {
				price = sq.price;

				HTML += "<tr><td class='propertycellcolor' style='background: " + sq.color + ";";

				if (sq.groupNumber == 1 || sq.groupNumber == 2) {
					HTML += " border: 1px solid grey;";
				} else {
					HTML += " border: 1px solid " + sq.color + ";";
				}

				// Player already paid interest, so they can unmortgage for the mortgage price.
				HTML += "' onmouseover='showdeed(" + i + ");' onmouseout='hidedeed();'></td><td class='propertycellname'><a href='javascript:void(0);' title='Hypothek auf " + sq.name + " für " + price + " zurückzahlen.' onclick='if (" + price + " <= player[" + p.creditor + "].money) {player[" + p.creditor + "].pay(" + price + ", 0); square[" + i + "].mortgage = false; addAlert(\"" + player[p.creditor].name + " hat die Hypothek für " + sq.name + " für " + price + " zurückgezahlt.\");} this.parentElement.parentElement.style.display = \"none\";'>Hypothek auf " + sq.name + " zurückzahlen (" + price + ")</a></td></tr>";

				sq.owner = p.creditor;

			}
		}

		HTML += "</table>";

		this.SOCKET_LIST[this.turn].emit('eliminatePlayer', HTML);

		this.popup(HTML);
    	this.eliminatePlayer();
	};

	resign = function() {
		this.#bankruptcy();
	};

	#bankruptcy() {
		var p = this.player[this.turn];
		var pcredit = this.player[p.creditor];
		var bankruptcyUnmortgageFee = 0;


		if (p.money >= 0) {
			return;
		}

		this.addAlert(p.name + " ist bankrott.");

		if (p.creditor !== 0) {
			pcredit.money += p.money;
		}

		for (var i = 0; i < 12; i++) {
			sq = this.square[i];
			if (sq.owner == p.index) {
				// Mortgaged properties will be tranfered by bankruptcyUnmortgage();
				if (!sq.mortgage) {
					sq.owner = p.creditor;
				} else {
					//bankruptcyUnmortgageFee += Math.round(sq.price * 0.1);
				}

				if (sq.house > 0) {
					if (p.creditor !== 0) {
						pcredit.money += sq.houseprice * 0.5 * sq.house;
					}
					sq.hotel = 0;
					sq.house = 0;
				}

				if (p.creditor === 0) {
					sq.mortgage = false;
					sq.owner = 0;
				}
			}
		}

        this.updateMoney();

		if (this.pcount === 2 || bankruptcyUnmortgageFee === 0 || p.creditor === 0) {
			this.eliminatePlayer();
		} else {
			//addAlert(pcredit.name + " paid $" + bankruptcyUnmortgageFee + " interest on the mortgaged properties received from " + p.name + ".");
			//this.popup("<p>" + pcredit.name + ", you must pay $" + bankruptcyUnmortgageFee + " interest on the mortgaged properties you received from " + p.name + ".</p>");
			this.player[pcredit.index].pay(bankruptcyUnmortgageFee, 0); 
     		this.#bankruptcyUnmortgage();
		}
	};

	popup(HTML, option, doMortgage, key=this.turn) {
		if (!this.player[key].human) return;
  		this.SOCKET_LIST[key].emit('popup', HTML, option, doMortgage);
	}

	popupAll(HTML, option, doMortgage) {
		for (var i in this.SOCKET_LIST) {
			this.SOCKET_LIST[i].emit('popup', HTML, option, doMortgage);
		}
	}

	updateOwned() {
		for(var i in this.SOCKET_LIST){
			this.SOCKET_LIST[i].emit('updateOwned', this.player, this.square);
		}
		
		this.updateOption();
	}

	updateMoney() {
		for(var i in this.SOCKET_LIST){
			this.SOCKET_LIST[i].emit('updateMoney', this.player, this.turn, this.meineBank, this.meinStaat, this.pcount);
		  }
	}

	updateOption(key=this.turn) {
		if (this.SOCKET_LIST[key] == undefined) return;
		this.SOCKET_LIST[key].emit('updateOption', this.square);
	}

	addAlert(alertText) {
		for(var i in this.SOCKET_LIST){
			this.SOCKET_LIST[i].emit('addAlert', alertText);
	  }
	}	
	
	updatePosition(p_old) {
		for (var i in this.SOCKET_LIST) {
			this.SOCKET_LIST[i].emit("updatePosition", this.turn, p_old, this.player[this.turn]);
		}
	}

	roll() {
		roll(this);
	}

	buyHouse2(buy=true) {
		this.SOCKET_LIST[this.turn].emit('buyhouse2', buy)
	}

	showStats(HTML, key) {
		this.SOCKET_LIST[key].emit('showstats', HTML);
	}

	show(item, key=this.turn) {
		this.SOCKET_LIST[key].emit('show', item, true);
	}

	hide(item, key=this.turn) {
		this.SOCKET_LIST[key].emit('show', item, false);
	}

	changeButton(button, value, title, key=this.turn) {
		this.SOCKET_LIST[key].emit('changeButton', button, value, title);
	}

	receiveOffer(key=this.turn) {
		this.SOCKET_LIST[key].emit('receiveOffer', this.tradeObj);
	}

	sendAuction() {
		this.SOCKET_LIST[this.currentbidder].emit("auction", this.auctionproperty, this.player, this.square, this.highestbidder, this.highestbid)
	}

	setup() {
		for(var i in this.SOCKET_LIST){
			this.show("#control, #board, #moneybar, #icon-bar", i);
			this.hide("#setup, #nextbutton, #resignbutton, #creditbutton", i);
			this.SOCKET_LIST[i].emit('displayFigures', this.player, this.pcount);
			this.SOCKET_LIST[i].emit('updateSquare', this.square);
		  } 
	}

	updateChart() {
		for (var i in this.SOCKET_LIST) {
			this.SOCKET_LIST[i].emit('updateChart');
		}
	}

	sendRoll(key=this.turn) {
		this.SOCKET_LIST[key].emit('roll');
	}

	setHTML(item, text, key=this.turn) {
		this.SOCKET_LIST[key].emit('setHTML', item, text);
	}

	socketUndefined(key=this.turn) {
		return this.SOCKET_LIST[key] == undefined
	}

	focusButton(button, key=this.turn) {
		this.SOCKET_LIST[key].emit('focusbutton', button);
	}

	showdeed(property, key=this.turn) {
		var sq = this.square[property];
		this.SOCKET_LIST[key].emit('showdeed', sq);
	}
}