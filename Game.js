module.exports = function Game() {
	var die1;
	var areDiceRolled = false;

	this.zinssatz = 10;

	this.phase = 1;

	this.auctionQueue = [];
	this.highestbidder;
	this.highestbid;
	this.currentbidder = 1;
	this.auctionproperty;

    var tradeObj;

	// Auction functions:
	this.finalizeAuction = function() {
		var p = player[this.highestbidder];
		var sq = square[this.auctionproperty];

		if (this.highestbid > 0) {
			p.pay(this.highestbid, 0);
			sq.owner = this.highestbidder;
			addAlert(p.name + " hat " + sq.name + " für " + this.highestbid + " ersteigert.");
			player[turn].money += this.highestbid;
			payeachplayer(this.highestbid / 2, "Versteigerung");
		}

		for (var i = 1; i <= pcount; i++) {
			player[i].bidding = true;
		}

		play();
	};

	this.addPropertyToAuctionQueue = function(propertyIndex) {
		this.auctionQueue.push(propertyIndex);
	};

	this.auction = function() {
		if (this.auctionQueue.length === 0) {
			return false;
		}

		var index = this.auctionQueue.shift();

		var s = square[index];

		this.auctionproperty = index;
		this.highestbidder = 0;
		this.highestbid = 0;
		this.currentbidder = turn + 1;

		if (this.currentbidder > pcount) {
			this.currentbidder -= pcount;
		}

		if (player[this.currentbidder].human) {
			SOCKET_LIST[this.currentbidder].emit("auction", this.auctionproperty, player, square, this.highestbidder, this.highestbid)
		} else {
			player[this.currentbidder].AI.bid(this.auctionproperty, this.highestbid);
		}
				
		updateMoney();
		return true;
	};


	this.rollDice = function() {
		die1 = Math.floor(Math.random() * 6) + 1;
		areDiceRolled = true;
	};

	this.resetDice = function() {
		areDiceRolled = false;
	};

	this.next = function() {
		if (areDiceRolled) {
			play();
		} else {
			roll();
		}
	};

	this.getDie = function() {
		return die1;
	};

	// Credit functions:

	this.kreditAufnehmen = function(amount, key=turn) {
		var initiator = player[key];
		initiator.update();

		if (initiator.sumKredit + amount > initiator.verfuegbareHypothek) {
			popup("<p>" + initiator.name + ", deine verfügbare Hypothek ist geringer als " + amount + ".</p>", key=key);
			return false;
		}

		initiator.kreditAufnehmen(amount);
	}

	this.kreditTilgen = function(amount,key=turn) {
    	var initiator = player[key];

		if (amount > initiator.money) {
			popup("<p>" + initiator.name + ", du hast keine " + amount + ".</p>", key=key);
			return false;
		}

		initiator.kreditTilgen(amount);		
	}

	// Bankrupcy functions:


	this.eliminatePlayer = function(key=turn) {
		var p = player[key];
		if (p==undefined) return;

		var isPlayerTurn = key == turn;

		playerNo -= 1;
		delete playerNames[key];

		for (var i = p.index; i < pcount; i++) {
			player[i] = player[i + 1];
			player[i].index = i;

		}

		for (var i = 0; i < 12; i++) {
			if (square[i].owner >= p.index) {
				square[i].owner--;
			}
		}

		pcount--;
		if (key <= turn)
			turn--;
		if (turn == 0) {
			turn = pcount;
		}

		delete SOCKET_LIST[key];
		for (var i = p.index; i < pcount+1; i++) {
			if (SOCKET_LIST[i+1] == undefined) break;
			playerNames[i] = playerNames[i + 1];
			SOCKET_LIST[i] = SOCKET_LIST[i + 1];
			SOCKET_LIST[i].emit('setPlayerId', i);
		}	
		delete SOCKET_LIST[pcount+1];
		delete playerNames[pcount+1];

		updateOwned();
		updateMoney();

		if (Object.keys(SOCKET_LIST).length == 0) {
			player = [];
			return;
		}
		/*if (pcount === 2) {
			document.getElementById("stats").style.width = "454px";
		} else if (pcount === 3) {
			document.getElementById("stats").style.width = "686px";
		}*/ //TODO

		if (pcount === 1) {
			updateMoney();
			SOCKET_LIST[turn].emit('show', '#control, #board', false);
			SOCKET_LIST[turn].emit('show', '#refresh', true);

			popup("<p>Glückwunsch, " + player[1].name + ", du hast das Spiel gewonnen.</p><div>");

		} else if (isPlayerTurn){
			play();
		}
	};

	this.bankruptcyUnmortgage = function() {
		var p = player[turn];

		if (p.creditor === 0) {
			this.eliminatePlayer();
			return;
		}

		var HTML = "<p>" + player[p.creditor].name + ", du darfst die Hypothek für eines der folgenden Grundstücke zurückzahlen, indem du darauf klickst. Klicke OK, wenn du fertig bist.</p><table>";
		var price;

		for (var i = 0; i < 12; i++) {
			sq = square[i];
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

    SOCKET_LIST[turn].emit('eliminatePlayer', HTML);

		popup(HTML);
    this.eliminatePlayer();
	};

	this.resign = function() {
		this.bankruptcy();
	};

	this.bankruptcy = function() {
		var p = player[turn];
		var pcredit = player[p.creditor];
		var bankruptcyUnmortgageFee = 0;


		if (p.money >= 0) {
			return;
		}

		addAlert(p.name + " ist bankrott.");

		if (p.creditor !== 0) {
			pcredit.money += p.money;
		}

		for (var i = 0; i < 12; i++) {
			sq = square[i];
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

        updateMoney();

		if (pcount === 2 || bankruptcyUnmortgageFee === 0 || p.creditor === 0) {
			this.eliminatePlayer();
		} else {
			//addAlert(pcredit.name + " paid $" + bankruptcyUnmortgageFee + " interest on the mortgaged properties received from " + p.name + ".");
			//popup("<p>" + pcredit.name + ", you must pay $" + bankruptcyUnmortgageFee + " interest on the mortgaged properties you received from " + p.name + ".</p>");
      player[pcredit.index].pay(bankruptcyUnmortgageFee, 0); 
      this.bankruptcyUnmortgage();
		}
	};

}