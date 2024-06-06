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
			game.payeachplayer(this.highestbid / 2, "Versteigerung");
		}

		for (var i = 1; i <= pcount; i++) {
			this.player[i].bidding = true;
		}

		this.play();
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
			this.play();
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
			this.popup(initiator.name + ", deine verfügbare Hypothek ist geringer als " + amount + ".", key=key);
			return false;
		}

		initiator.kreditAufnehmen(amount);
	}

	kreditTilgen(amount,key=this.turn) {
    	var initiator = this.player[key];

		if (amount > initiator.money) {
			this.popup("" + initiator.name + ", du hast keine " + amount + ".", key=key);
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

			this.popup("Glückwunsch, " + this.player[1].name + ", du hast das Spiel gewonnen.");

		} else if (isPlayerTurn){
			this.play();
		}
	};

	bankruptcyUnmortgage() {
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
		this.bankruptcy();
	};

	bankruptcy() {
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
     		this.bankruptcyUnmortgage();
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

	buyHouse2(buy=true) {
		this.SOCKET_LIST[this.turn].emit('buyhouse2', buy)
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

	auctionHouse(){
		if (this.player[this.turn].human) {
			this.chooseProperty();
		} else {
			// choose property at random
			var properties = new Array();
			for (var i in this.square) {
				if (this.square[i].owner == turn) {
					properties.push(i);
				}
			}
			if (properties.length == 0) return;
			properties.sort(function() { return 0.5 - Math.random();});
			this.addPropertyToAuctionQueue(properties.pop());
			this.auction();
		}
	}

	sellHouse(index) {
		var sq = this.square[index];
		var p = this.player[sq.owner];
	
		sq.house--;
		this.addAlert(p.name + " hat ein Haus in der " + sq.name + " verkauft.");
	
		p.money += sq.houseprice;
		this.meineBank.pay(sq.houseprice, sq.owner);
		this.updateOwned();
		this.updateMoney();
	}
	
	buy() {
		var p = this.player[turn];
		var property = this.square[p.position];
		var cost = property.price;
	
		if (p.money >= cost) {
			p.pay(cost, 0);
	
			property.owner = turn;
			this.updateMoney();
			this.addAlert(p.name + " hat " + property.name + " für " + property.houseprice + " gekauft.");
	
			this.updateOwned();
			p.update();
	
			if (p.human) this.hide("#landed");
	
		} else {
			this.popup(p.name + ", du brauchst weitere " + (property.price - p.money) + " um " + property.name + " zu kaufen.");
		}
	}
	
	mortgage(index) {
		var sq = this.square[index];
		var p = this.player[sq.owner];
	
		if (sq.mortgage) {
			return false;
		}
	
		var mortgagePrice = sq.price;
	
		sq.mortgage = true;
		p.money += mortgagePrice;
	
	  var value = "Hypothek zurückzahlen für " + mortgagePrice;
	  var title = "Hypothek auf " + sq.name + " zurückzahlen für " + mortgagePrice + ".";
	
		  if (p.human) this.changeButton("mortgagebutton", value, title);
	
		this.addAlert(p.name + " hat eine Hypothek auf " + sq.name + " für " + mortgagePrice + " aufgenommen.");
		this.updateOwned();
		this.updateMoney();
	
		return true;
	}
	
	handleOffer(){
		var receiver = this.tradeObj.initiator.index;
		if (receiver == 0) {
			var money;
			var initiator;
			var recipient;
	
			money = this.tradeObj.money;
			var anleihen = this.tradeObj.anleihen;
			var derivate = this.tradeObj.derivate;
			initiator = this.meineBank;
			recipient = this.player[this.tradeObj.recipient.index];
	
			if (this.tradeObj.assets.length > 0) {
				this.popup("Es können keine Fahrzeuge oder Yachten an die Bank verkauft werdem.", key=receiver);
				return;
			}
			
			if (money + anleihen + (derivate * initiator.derivateKurs) != 0)
				return;
	
			// Exchange money.
			if (money > 0) {
				initiator.pay(money, recipient.index);
				recipient.money += money;
	
				this.addAlert(recipient.name + " hat " + money + " von " + initiator.name + " erhalten.");
			} else if (money < 0) {
				recipient.pay(-money, initiator.index);
				initiator.zinsenLotto -= money;
	
				this.addAlert(initiator.name + " hat " + (-money) + " von " + recipient.name + " erhalten.");
			}
	
			//stock exchange
			if (anleihen > 0) {
				initiator.anleihen -= anleihen;
				recipient.anleihen += anleihen;
	
				this.addAlert(recipient.name + " hat Anleihen im Wert von " + anleihen + " von " + initiator.name + " erhalten.");
			} else if (anleihen < 0) {
				initiator.anleihen -= anleihen;
				recipient.anleihen += anleihen;
	
				this.addAlert(initiator.name + " hat Anleihen im Wert von " + (-anleihen) + " von " + recipient.name + " erhalten.");
			}
	
			if (derivate > 0) {
				initiator.derivate -= derivate;
				recipient.derivate += derivate;
	
				this.addAlert(recipient.name + " hat Derivate im Wert von " + derivate + " von " + initiator.name + " erhalten.");
			} else if (derivate < 0) {
				initiator.derivate -= derivate;
				recipient.derivate += derivate;
	
				this.addAlert(initiator.name + " hat Anleihen im Wert von " + (-derivate) + " von " + recipient.name + " erhalten.");
			}
	
			this.updateOwned()
			this.updateMoney()
			return;
		}
		else if (!this.player[receiver].human) {
			var result = this.player[receiver].AI.acceptTrade(this.tradeObj);
			if (result === false) {
				return;
			} else if (result === true) {
				var money;
				var initiator;
				var recipient;
	
				money = this.tradeObj.money;
				var anleihen = this.tradeObj.anleihen;
				var derivate = this.tradeObj.derivate;
				initiator = this.player[receiver];
				recipient = this.player[this.tradeObj.recipient.index];
				var tradeAssets = this.tradeObj.assets;
	
				//Exchange properties
				for (var i = 0; i < 12; i++) {
					
					if (this.tradeObj.property[i] === 1) {
						this.square[i].owner = recipient.index;
						this.addAlert(recipient.name + " hat " + this.square[i].name + " von " + initiator.name + " erhalten.");
					} else if (this.tradeObj.property[i] === -1) {
						this.square[i].owner = initiator.index;
						this.addAlert(initiator.name + " hat " + this.square[i].name + " von " + recipient.name + " erhalten.");
					}
				}
	
				//Exchange assets
				if (tradeAssets.length == 3) {
					recipient.motorrad += tradeAssets[0]
					initiator.motorrad -= tradeAssets[0]
					if (tradeAssets[0] > 0) {
						this.addAlert(recipient.name + " hat Motorrad von " + initiator.name + " erhalten.");
					}
					else if (tradeAssets[0] < 0) {
						this.addAlert(initiator.name + " hat Motorrad von " + recipient.name + " erhalten.");
					}
					recipient.auto += tradeAssets[1]
					initiator.auto -= tradeAssets[1]
					if (tradeAssets[1] > 0) {
						this.addAlert(recipient.name + " hat Auto von " + initiator.name + " erhalten.");
					}
					else if (tradeAssets[1] < 0) {
						this.addAlert(initiator.name + " hat Auto von " + recipient.name + " erhalten.");
					}
					recipient.yacht += tradeAssets[2]
					initiator.yacht -= tradeAssets[2]
					if (tradeAssets[2] > 0) {
						this.addAlert(recipient.name + " hat Yacht von " + initiator.name + " erhalten.");
					}
					else if (tradeAssets[2] < 0) {
						this.addAlert(initiator.name + " hat Yacht von " + recipient.name + " erhalten.");
					}
				}
	
				// Exchange money.
				if (money > 0) {
					initiator.pay(money, recipient.index);
					recipient.money += money;
	
					this.addAlert(recipient.name + " hat " + money + " von " + initiator.name + " erhalten.");
				} else if (money < 0) {
					recipient.pay(-money, initiator.index);
					initiator.money -= money;
	
					this.addAlert(initiator.name + " hat " + (-money) + " von " + recipient.name + " erhalten.");
				}
	
				//stock exchange
				if (anleihen > 0) {
					initiator.anleihen -= anleihen;
					recipient.anleihen += anleihen;
	
					this.addAlert(recipient.name + " hat Anleihen im Wert von " + anleihen + " von " + initiator.name + " erhalten.");
				} else if (anleihen < 0) {
					initiator.anleihen -= anleihen;
					recipient.anleihen += anleihen;
	
					this.addAlert(initiator.name + " hat Anleihen im Wert von " + (-anleihen) + " von " + recipient.name + " erhalten.");
				}
	
				if (derivate > 0) {
					initiator.derivate -= derivate;
					recipient.derivate += derivate;
	
					this.addAlert(recipient.name + " hat Derivate im Wert von " + derivate + " von " + initiator.name + " erhalten.");
				} else if (derivate < 0) {
					initiator.derivate -= derivate;
					recipient.derivate += derivate;
	
					this.addAlert(initiator.name + " hat Derivate im Wert von " + (-derivate) + " von " + recipient.name + " erhalten.");
				}
	
				this.updateOwned()
				this.updateMoney()
				return;
			} else {
				this.tradeObj = result;
				this.receiveOffer(this.tradeObj.initiator.index);
			}
			return;
		}
		this.receiveOffer(receiver);
	}
	
	bid() {
		
		while (true) {
			this.currentbidder++;
	
			if (this.currentbidder > this.pcount) {
				this.currentbidder -= this.pcount;
			}
			if (this.currentbidder == this.highestbidder) {
				this.finalizeAuction();
				return;
			} else if (this.player[this.currentbidder].bidding) {
				break;
			}
	
		}
		if (this.player[this.currentbidder].human) {
			this.sendAuction();
		} else {
			this.player[this.currentbidder].AI.bid(this.auctionproperty, this.highestbid);
		}
	  }



	unmortgage(index) {
		var sq = this.square[index];
		var p = this.player[sq.owner];
		var mortgagePrice = sq.price;

		if (mortgagePrice > p.money || !sq.mortgage) {
			return false;
		}

		p.pay(mortgagePrice, 0);
		sq.mortgage = false;

		let value = "Hypothek aufnehmen für " + mortgagePrice;
		let title = "Hypothek auf " + sq.name + " für " + mortgagePrice + " aufnehmen.";

		if (p.human) this.changeButton("mortgagebutton", value, title);

		this.addAlert(p.name + " hat die Hypothek für " + sq.name + " für " + unmortgagePrice + " zurückgezahlt.");
		this.updateOwned();
		return true;
	}

	land() {

		var p = this.player[this.turn];
		var s = this.square[p.position];

		if (p.human) {
			this.show("#landed");
			this.setHTML("landed", "Du bist auf " + s.name + " gelandet.");
		}
		
		s.landcount++;
		this.addAlert(p.name + " ist auf " + s.name + " gelandet.");

		// Allow player to buy the property on which he landed.
		if (s.price !== 0 && s.owner === 0) {
			if (!p.human) {
				if (p.AI.buyProperty(p.position)) {
					this.buy();
				}
			} else {
				this.setHTML("landed", "<div>Du bist auf <a href='javascript:void(0);' onmouseover='showdeed(" + p.position + ");' onmouseout='hidedeed();' class='statscellcolor'>" + s.name + "</a> gelandet.<input type='button' onclick='buy();' value='Kaufe (" + s.price + ")' title='Kaufe " + s.name + " für " + s.houseprice + ".'/></div>");
			}
		}

		// Collect rent
		if (s.owner !== 0 && s.owner != this.turn) {
			var rent = 0;

			if (s.house === 1) {
				rent = s.rent;
			}
			
			this.addAlert(p.name + " hat " + rent + " Miete an " + this.player[s.owner].name + " gezahlt.");
			p.pay(rent, s.owner);
			this.player[s.owner].money += rent;

			if (p.human) this.setHTML("landed", "Du bist auf " + s.name + " gelandet. " + this.player[s.owner].name + " hat " + rent + " Miete kassiert.");
		}

		this.updateMoney();

		this.chanceCommunityChest();
	}

	showEreignis(text, title) {
		for (var i in this.SOCKET_LIST) {
			this.SOCKET_LIST[i].emit('showEreignis', text, title);
		}
	}

	chanceCommunityChest() {
		var p = this.player[this.turn];

		if (this.phase == 1) {
			// Chance
			if (p.position === 3 || p.position === 9) {
				var chanceIndex = chanceCards.deck[this.chanceIndex];

				this.showEreignis(chanceCards[chanceIndex].text, chanceCards[chanceIndex].title);

				this.chanceAction(chanceIndex);

				this.chanceIndex++;

				if (this.chanceIndex >= chanceCards.deck.length) {
					this.chanceIndex = 0;
				}
			} else if (!p.human) {
				if (!p.AI.onLand()) {
					this.next();
				}
			}
		} else {
			// Chance
			if (p.position === 3 || p.position === 9) {
				if (this.chanceIndex >= chanceCards2.deck.length) {
					this.chanceIndex = 0;
				}

				var chanceIndex = chanceCards2.deck[this.chanceIndex];

				this.showEreignis(chanceCards2[chanceIndex].text, chanceCards2[chanceIndex].title);

				this.chanceAction(chanceIndex);

				this.chanceIndex++;

				if (this.chanceIndex >= chanceCards2.deck.length) {
					this.chanceIndex = 0;
				}
			} else if (!p.human) {
				if (!p.AI.onLand()) {
					this.next();
				}
			}
		}
	}

	roll() {
		var p = this.player[this.turn];

		if (p == undefined) return;

		if (p.human) {
			this.sendRoll();
			this.changeButton("nextbutton", "Spielzug beenden", "Spielzug beenden und zum/zur nächsten SpielerIn wechseln.");
		}
	
		this.rollDice();
		this.updateDice();
		setTimeout(() => { this.move();}, 1000);

	}

	move() {
		var p = this.player[this.turn];
		var die1 = this.getDie();

		this.addAlert(p.name + " hat " + die1 + " gewürfelt.");

		if (p.human) this.changeButton("nextbutton", "Spielzug beenden", "Spielzug beenden und zum/zur nächsten SpielerIn wechseln.");


		var p_old = p.position;
		// Move player
		p.position += die1;

		// Pay interest as you pass GO
		if (p_old < 6 && p.position >= 6) {
			this.citytax();
		}
		if (p.position >= 12) {
			p.position -= 12;
			var kreditZinsen = Math.floor(p.sumKredit * this.zinssatz / 100);
			this.meineBank.zinsenLotto += kreditZinsen
			p.pay(kreditZinsen, 0);
			if (p.money < 0) {
				var dispoZinsen = Math.floor(-p.money * this.dispoZinssatz / 100);
				this.meineBank.zinsenLotto += dispoZinsen
				p.pay(dispoZinsen, 0);
			}
			
			this.addAlert(p.name + " ist über Start gezogen und hat Zinsen auf Kredite gezahlt.");
		}

		this.updatePosition(p_old)
		setTimeout(() => {this.land();}, 2000);
	}

	play() {  

		if (this.player[this.turn].human && this.player[this.turn].money < 0) {
			this.popup("Du hast dein Konto um " + (-this.player[this.turn].money) + " überzogen. Nimm einen Kredit auf, um Dispo-Zinsen zu vermeiden.")
		}

		this.percent = 0;
		this.discount = 0;
		this.turn++;
		if (this.turn > this.pcount) {
			this.turn -= this.pcount;
		}

		if (this.socketUndefined() && this.player[this.turn].AI == null) return;
		
		var p = this.player[this.turn];
		this.resetDice();
		if (p.human) {
			this.show("#nextbutton");
			this.setHTML("pname", p.name);
		}
		this.addAlert(p.name + " ist an der Reihe.");

		this.updateChart();

		// Check for bankruptcy.
		p.pay(0, p.creditor);

		if (p.human) {
			this.hide("#landed, #option, #manage, #audio");
			this.show("#board, #control, #moneybar, #buy");

			this.focusButton("nextbutton");
			this.changeButton("nextbutton", "Würfeln", "Würfeln und Figur entsprechend vorrücken.");

			this.hide("#die0");
		}


		for (var i in this.SOCKET_LIST) {
			this.hide(".money-bar-arrow", i);
			this.show("#p" + this.turn + "arrow", i);
		}

		if (!p.human) {
			if (!p.AI.beforeTurn()) {
				this.next();
			}
		}
	}

	citytax() {
		this.addAlert(this.player[this.turn].name + " ist auf oder über das Feld Staat/Finanzamt gezogen und Steuern aufs Guthaben gezahlt.");
		//TODO: ask to buy Vermögensgegenstände
		var steuer = Math.floor(0.1 * this.player[this.turn].money);
		this.player[this.turn].pay(steuer, 0);
		this.meinStaat.steuer += steuer;

		if (this.player[this.turn].color == "gold") {
			for (var i = 0; i < this.pcount; i++) {
				this.player[i+1].money += Math.floor(this.player[i+1].anleihen * (this.zinssatz / 100));
				this.meinStaat.steuer -= Math.floor(this.player[i+1].anleihen * (this.zinssatz / 100));
			}
			this.meineBank.zinsenLotto += Math.floor(this.meineBank.anleihen * (this.zinssatz / 100));
			this.meinStaat.zinsenLotto -= Math.floor(this.meineBank.anleihen * (this.zinssatz / 100));

			this.addAlert(" Der Staat hat Zinsen auf alle Anleihen gezahlt.");
		}

		if (this.meinStaat.steuer < 0) {
			if (this.phase = 1) {
				this.phase = 2;
				this.popupAll("Phase 2 beginnt.")
			}
			this.meineBank.geldMenge -= this.meinStaat.steuer;
			this.meineBank.buyAnleihen(this.meinStaat.steuer);
			this.meinStaat.staatsSchuld += this.meinStaat.steuer;
			this.meinStaat.steuer = 0;
		}
	}

	chanceAction(chanceIndex) {
		var p = this.player[this.turn]; // This is needed for reference in action() method.
	
		if (this.phase == 1)
			chanceCards[chanceIndex].action(this);
		else
			chanceCards2[chanceIndex].action(this);
	
		this.updateMoney();
	
		if (!p.human) {
			setTimeout(() => { this.next();}, 5000);
		}
	}
	
	
	payeachplayer(amount, cause) {
		var p = this.player[this.turn];
		var total = 0;
	
		amount = Math.floor(amount / (this.pcount - 1));
	
		for (var i = 1; i <= this.pcount; i++) {
			if (i != this.turn) {
				this.player[i].money += amount;
				total += amount;
				var creditor = p.money >= 0 ? i : creditor;
	
				p.pay(amount, creditor);
			}
		}
		if (cause == "Hauskauf")
			{this.addAlert(p.name + " hat für " + total + " ein Haus gekauft.");}
		else
			{this.addAlert(p.name + " hat " + total + " durch " + cause + " verloren.");}
	}
	
	payState(amount, reason="") {
		var p = this.player[this.turn];
	
		this.meinStaat.steuer += amount;
	
		if (this.meinStaat.steuer < 0) {
			if (this.phase = 1) {
				this.phase = 2;
				this.popupAll("Phase 2 beginnt.");
			}
			this.meineBank.geldMenge -= this.meinStaat.steuer;
			this.meineBank.buyAnleihen(-this.meinStaat.steuer);
			this.meinStaat.staatsSchuld += this.meinStaat.steuer;
			this.meinStaat.steuer = 0;
		}
	
		p.pay(amount, 0);
		if (amount < 0) {
			this.addAlert(p.name + " hat " + (-amount) + reason + " vom Staat erhalten.");
		} else {
			this.addAlert(p.name + " hat " + amount + " an den Staat gezahlt.");
		}
	}
	
	sozialHilfe(key=this.turn) {
		var p = this.player[key];
		var amount = p.money - p.sumKredit + p.verfuegbareHypothek;
		this.payState(amount, " Sozialhilfe");
	}
	
	buyHouse(index) {
	
		var sq = this.square[index];
		var p = this.player[sq.owner];
	
	  var houseSum = 0;
	
	  var price = (sq.houseprice - this.discount) * (1 - this.percent / 100);
	
	  if (p.money < price) {
		this.popup("Du brauchst " + (price - this.player[sq.owner].money) + " mehr um ein Haus in der " + sq.name + " zu kaufen.");
		return false;
	  }
	
	  for (var i = 0; i < 12; i++) {
		  houseSum += this.square[i].house;
	  }
	
	  if (sq.house < 2 && houseSum >= 11) {
		this.popup("Alle 11 Häuser sind verkauft.");
		  return false;
	  } 
	
	  if (this.phase == 1 && sq.house < 1) {
		sq.house++;
		this.addAlert(p.name + " hat ein Haus in der " + sq.name + " gekauft.");
	  } else if (this.phase == 2 && sq.house < 2) {
		sq.house++;
		this.addAlert(p.name + " hat ein Haus in der " + sq.name + " gekauft.");
		this.payState(price - sq.houseprice);
		if (!this.socketUndefined())
			this.buyHouse2(false);
		else {
			return;
		}
	  }  else {
		return;
	  }
	
	  this.payeachplayer(sq.houseprice, "Hauskauf");
	
	  this.updateOwned();
	  this.updateMoney();
		
	}
}

class Staat {
	constructor() {
		this.staatsSchuld = 0;
		this.steuer = 0;
	}
}

const Card = require('./Card');
var chanceCards = Card.chanceCards;
var chanceCards2 = Card.chanceCards2;