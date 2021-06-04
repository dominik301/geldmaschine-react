var remote_players = {};

var express = require('express');
const { title } = require('node:process');
var app = express();

var server = require('http').createServer(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));


console.log("Server started.");

SOCKET_LIST = {};

var playerNo = 1;
var playerNames = {};

var io = require('socket.io')(server);
io.sockets.on('connection', function(socket){
              
  console.log('new user!');
  //var socketId = Math.random();
  //SOCKET_LIST[socketId] = socket;

  var playerId = playerNo++;
  SOCKET_LIST[playerId] = socket;
  //inform client of player's id
  socket.emit('setPlayerId', playerId);

  for(var i in SOCKET_LIST){
    SOCKET_LIST[i].emit('playerno', playerNo-1);
	SOCKET_LIST[i].emit('playerNames', playerNames);
  }

  socket.on('setup',function(isKapitalismus, pnumber, nieten){
    setup(isKapitalismus, pnumber, nieten);         
  });

  socket.on('zinssatz', function(data) {
	game.zinssatz = parseInt(data);
	console.log('zinssatz changed to', game.zinssatz)
  })

  socket.on('next',function(){
    game.next();        
  });

  socket.on('resign',function(){
    game.resign();        
  });

  socket.on('buyhouse',function(checkedProperty){
    Object.keys(SOCKET_LIST).forEach(function eachKey(key) {
		if(SOCKET_LIST[key] == socket && key != turn){
			socket.emit('popup', player[key]. name + ", du bist nicht an der Reihe!");
			return;
		}
		else if (SOCKET_LIST[key] == socket){
			buyHouse(checkedProperty);  
		}
	});
  });

  socket.on('mortgage',function(checkedProperty){
	for (var key in SOCKET_LIST) {
		if(SOCKET_LIST[key] == socket && key != turn){
			socket.emit('popup', player[key]. name + ", du bist nicht an der Reihe!");
			return;
		}
	}

    var s = square[checkedProperty];

    if (s.mortgage) {
        if (player[s.owner].money < s.houseprice) {
            popup("<p>Du brauchst " + (s.price - player[s.owner].money) + " mehr um die Hypothek für " + s.name + " zurückzuzahlen.</p>");

        } else {
            popup("<p>" + player[s.owner].name + ", möchtest du wirklich die Hypothek für " + s.name + " für " + s.price + " zurückzahlen?</p>", "Ja/Nein", true);
        }
    } else {
        popup("<p>" + player[s.owner].name + ", mächstest du wirkliche eine Hypothek für " + s.name + " für " + s.price + " aufnehmen?</p>", "Ja/Nein", true);
    } 
  });

  socket.on('doMortgage', function (checkedProperty){
    var s = square[checkedProperty];

    if (s.mortgage) {
      unmortgage(checkedProperty);
    } else {
      mortgage(checkedProperty);        
    } 
  });

  socket.on('sellhouse',function(checkedProperty){
	for (var key in SOCKET_LIST) {
		if(SOCKET_LIST[key] == socket && key != turn){
			socket.emit('popup', player[key]. name + ", du bist nicht an der Reihe!");
			return;
		}
	}
    sellHouse(checkedProperty);        
  });

  socket.on('kreditaufnehmen',function(data){
	Object.keys(SOCKET_LIST).forEach(function eachKey(key) {
		if(SOCKET_LIST[key] == socket){
			game.kreditAufnehmen(parseInt(data), key);
		}
	});
  });

  socket.on('kredittilgen',function(data){
	Object.keys(SOCKET_LIST).forEach(function eachKey(key) {
		if(SOCKET_LIST[key] == socket){
			game.kreditTilgen(parseInt(data), key);
		}
	});    
  });

  socket.on('eliminate',function(){
    game.eliminatePlayer();        
  });

  socket.on('updateOwned', updateOwned);

  socket.on('updateMoney', updateMoney);

  socket.on('updateOption', updateOption);

  socket.on('showstats', function() {
	Object.keys(SOCKET_LIST).forEach(function eachKey(key) {
		if(SOCKET_LIST[key] == socket){
			showStats(key);
		}
	});
  });

  socket.on('windowload', loadWindow); 

  socket.on('setName', function(name) {
    Object.keys(SOCKET_LIST).forEach(function eachKey(key) {
      if(SOCKET_LIST[key] == socket){
        playerNames[key] = name;
	  }
    });
	for(var i in SOCKET_LIST){
		SOCKET_LIST[i].emit('playerNames', playerNames);
	  }
  });

  socket.on('showdeed', function(property) {
	Object.keys(SOCKET_LIST).forEach(function eachKey(key) {
		if(SOCKET_LIST[key] == socket){
			showdeed(property, key);
		}
	});
  })

  socket.on('updateSquare', function() {
    socket.emit('updateSquare', square);
  });

  socket.on('updatePlayer', function() {
    socket.emit('updatePlayer', player, meineBank);
  });

  socket.on('newTrade', function(ini, rec, mon, pro, anl, der) {
    game.tradeObj = new Trade(ini, rec, mon, pro, anl, der);
    socket.emit('tradeObj', game.tradeObj);
  });

  socket.on('sendOffer', function() {
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
    SOCKET_LIST[receiver].emit('receiveOffer', game.tradeObj);
  });

  socket.on('changeOwner', function(sq_idx, rcp_idx) {
    square[sq_idx].owner = rcp_idx;
  })

  socket.on('buyDerivate', function(initiator, recipient, derivate) {
	if (recipient instanceof Bank) {
		recipient.derivateBank += derivate;
	} else {
		recipient.derivate += derivate;
	}
  });

  socket.on('buyAnleihen', function(initiator, recipient, anleihen) {
	if (recipient instanceof Bank) {
		recipient.anleihenBank += anleihen;
	} else {
		recipient.anleihen += anleihen;
	}
  });

  socket.on("newbid", function(highestbidder, highestbid) {
	game.highestbidder = highestbidder;
	game.highestbid = highestbid;
	  
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
	SOCKET_LIST[game.currentbidder].emit("auction", game.auctionproperty, player, square, game.highestbidder, game.highestbid)
  })

  socket.on("auctionExit", function(currentbidder) {
	player[currentbidder].bidding = false;
  });

  socket.on("finalizeAuction", function() {
	  game.finalizeAuction();
  });

  socket.on("auctionHouse", function(propertyindex) {
	  auctionHouseP(propertyindex);
  });

  socket.on('disconnect',function(){
	Object.keys(SOCKET_LIST).forEach(function eachKey(key) {
		if(SOCKET_LIST[key] == socket){
			if (game) {
				game.eliminatePlayer(key);
			} else {
				playerNo -= 1;
				delete playerNames[key];
				delete SOCKET_LIST[key];

				for (var i = parseInt(key); i < playerNo; i++) {
					playerNames[i] = playerNames[i + 1];
					SOCKET_LIST[i] = SOCKET_LIST[i + 1];
					SOCKET_LIST[i].emit('setPlayerId', i);
				}
			}
		}
	});
	});

  socket.on('pay', function(initiator, recipient, money) {
	p1 = player[initiator.index]
	p2 = player[recipient.index]

	p1.pay(money, recipient.index);
    p2.money += money;
  })

  socket.on('buy', function() {
	Object.keys(SOCKET_LIST).forEach(function eachKey(key) {
		if(SOCKET_LIST[key] == socket && key == turn){
			buy();
		}
	});
  });
	
});

var port = process.argv[2] == undefined ? 4141 : process.argv[2];
server.listen(port, "0.0.0.0");

//Start: Old code monopoly.js

function Game() {
	var die1;
	var areDiceRolled = false;

	this.zinssatz = 10;

	this.phase = 1;

	this.auctionQueue = [];
	this.highestbidder;
	this.highestbid;
	this.currentbidder = 1;
	this.auctionproperty;

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

		SOCKET_LIST[this.currentbidder].emit("auction", this.auctionproperty, player, square, this.highestbidder, this.highestbid)
		
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

  var tradeObj;

	// Trade functions:

	// Bankrupcy functions:


	this.eliminatePlayer = function(key=turn) {
		var p = player[key];

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
			playerNames[i] = playerNames[i + 1];
			SOCKET_LIST[i] = SOCKET_LIST[i + 1];
			SOCKET_LIST[i].emit('setPlayerId', i);
		}	
		delete SOCKET_LIST[pcount+1];
		delete playerNames[pcount+1];

		updateOwned();
		updateMoney();
		

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
			game.eliminatePlayer();
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
    game.eliminatePlayer();
	};

	this.resign = function() {
		game.bankruptcy();
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
			game.eliminatePlayer();
		} else {
			//addAlert(pcredit.name + " paid $" + bankruptcyUnmortgageFee + " interest on the mortgaged properties received from " + p.name + ".");
			//popup("<p>" + pcredit.name + ", you must pay $" + bankruptcyUnmortgageFee + " interest on the mortgaged properties you received from " + p.name + ".</p>");
      player[pcredit.index].pay(bankruptcyUnmortgageFee, 0); 
      game.bankruptcyUnmortgage();
		}
	};

}

var game;


function Player(name, color) {
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
	this.sumUmsatz = 0; //equals this.money
	this.anleihen = 0;
	this.derivate = 0;

	this.pay = function (amount, creditor) {
		if (amount <= this.money) {
			this.money -= amount;

			this.update();

			return true;
		} else {
			this.money -= amount;
			this.creditor = creditor;

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
		updateMoney();
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
	};

	this.kreditAufnehmen = function (amount) {
		if (this.sumKredit + amount <= this.verfuegbareHypothek) {
			this.money += amount;
			this.sumKredit += amount;

			meineBank.geldMenge += amount;

			updateMoney();

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

function Bank(name="Bank", color="black") {
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

			return true;
		} else {
			this.zinsenLotto -= amount;
			this.creditor = creditor;

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

function Staat() {
	this.staatsSchuld = 0;
	this.steuer = 0;
}

// paramaters:
// initiator: object Player
// recipient: object Player
// money: integer, positive for offered, negative for requested
// property: array of integers, length: 40

function Trade(initiator, recipient, money, property, anleihen=0, derivate=0) {
	// For each property and anleihen or derivate, 1 means offered, -1 means requested, 0 means neither.
  this.initiator = initiator;
  this.recipient = recipient;
  this.money = money;
  this.property = property;
  this.anleihen = anleihen;
  this.derivate = derivate;

	this.getInitiator = function() {
		return initiator;
	};

	this.getRecipient = function() {
		return recipient;
	};

	this.getProperty = function(index) {
		return property[index];
	};

	this.getMoney = function() {
		return money;
	};

	this.getAnleihen = function() {
		return anleihen;
	};

	this.getDerivate = function() {
		return derivate;
	};
}

function Credit(initiator, money) {
	// For each property and anleihen or derivate, 1 means offered, -1 means requested, 0 means neither.

	this.getInitiator = function() {
		return initiator;
	};

	this.getMoney = function() {
		return money;
	};
}

var player = [];
var pcount;
var turn = 0;
var meinStaat = new Staat();
var meineBank = new Bank();

// Overwrite an array with numbers from one to the array's length in a random order.
Array.prototype.randomize = function(length) {
	length = (length || this.length);
	var num;
	var indexArray = [];

	for (var i = 0; i < length; i++) {
		indexArray[i] = i;
	}

	for (var i = 0; i < length; i++) {
		// Generate random number between 0 and indexArray.length - 1.
		num = Math.floor(Math.random() * indexArray.length);
		this[i] = indexArray[num] + 1;

		indexArray.splice(num, 1);
	}
};

function addAlert(alertText) {
	for(var i in SOCKET_LIST){
    SOCKET_LIST[i].emit('addAlert', alertText);
  }
}


function updatePosition() {
  for (var i in SOCKET_LIST) {
    SOCKET_LIST[i].emit("updatePosition", square, turn, player);
  }
}

function updateMoney() {
  for(var i in SOCKET_LIST){
    SOCKET_LIST[i].emit('updateMoney', player, turn, meineBank, meinStaat, pcount);
  }
}

function updateDice() {
	var die0 = game.getDie();
  for(var i in SOCKET_LIST){
    SOCKET_LIST[i].emit('updateDice', die0);
  }
}

function updateOwned() {
  for(var i in SOCKET_LIST){
    SOCKET_LIST[i].emit('updateOwned', player, square);
  }
  
  updateOption();
}

function updateOption() {
	if (SOCKET_LIST[turn] == undefined) return;
  SOCKET_LIST[turn].emit('updateOption', square);
}

function chanceAction(chanceIndex) {
	var p = player[turn]; // This is needed for reference in action() method.

	if (game.phase == 1)
		chanceCards[chanceIndex].action(p);
	else
		chanceCards2[chanceIndex].action(p);

	updateMoney();
}


function payeachplayer(amount, cause) {
	var p = player[turn];
	var total = 0;

	amount = Math.floor(amount / (pcount - 1));

	for (var i = 1; i <= pcount; i++) {
		if (i != turn) {
			player[i].money += amount;
			total += amount;
			creditor = p.money >= 0 ? i : creditor;

			p.pay(amount, creditor);
		}
	}
	if (cause == "Hauskauf")
		{addAlert(p.name + " hat für " + total + " ein Haus gekauft.");}
	else
		{addAlert(p.name + " hat " + total + " durch " + cause + " verloren.");}
}

function advance(destination, pass) {
	var p = player[turn];
	
	if (typeof pass === "number") {
		if (p.position < pass) {
			p.position = pass;
		} else {
			p.position = pass;
			p.money -= Math.floor(p.sumKredit * game.zinssatz / 100);
			meineBank.zinsenLotto += Math.floor(p.sumKredit * game.zinssatz / 100);
			addAlert(p.name + " ist über Start gezogen und hat Zinsen auf Kredite gezahlt.");
		}
	}
	if (p.position < destination) {
		p.position = destination;
	} else {
		p.position = destination;
		p.money -= Math.floor(p.sumKredit * game.zinssatz / 100);
		meineBank.zinsenLotto += Math.floor(p.sumKredit * game.zinssatz / 100);
		addAlert(p.name + " ist über Start gezogen und hat Zinsen auf Kredite gezahlt.");
	}

	land();
}

function payplayer(position, amount) {
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

function payState(amount) {
	var p = player[turn];

	meinStaat.steuer += amount;

	if (meinStaat.steuer < 0) {
		meineBank.geldMenge -= meinStaat.steuer;
		meineBank.buyAnleihen(-meinStaat.steuer);
		meinStaat.staatsSchuld += meinStaat.steuer;
		meinStaat.steuer = 0;
	}

	p.pay(amount, 0);
	if (amount < 0) {
		addAlert(p.name + " hat " + (-amount) + " vom Staat erhalten.");
	} else {
		addAlert(p.name + " hat " + amount + " an den Staat gezahlt.");
	}
}

function sellRichest(amount) {
	
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

function sellPoorest(amount) {
	
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

function receiveFromBank(amount) {
	var p = player[turn];
	p.money += amount
	meineBank.derivateEmittieren(amount);
	meineBank.zinsenLotto -= amount;
}

function receiveBankguthaben() {
  var p = player[turn];
	p.money += meineBank.zinsenLotto;
	meineBank.zinsenLotto = 0;
}

percent = 0;
discount = 0;

function buyHouse(index) {

	var sq = square[index];
	var p = player[sq.owner];

  var houseSum = 0;

  price = (sq.houseprice - discount) * (1 - percent / 100);

  if (p.money < price) {
    popup("<p>Du brauchst " + (price - player[sq.owner].money) + " mehr um ein Haus in der " + sq.name + " zu kaufen.</p>");
    return false;
  }

  for (var i = 0; i < 12; i++) {
      houseSum += square[i].house;
  }

  if (sq.house < 2 && houseSum >= 11) {
      popup("<p>Alle 11 Häuser sind verkauft.</p>");
      return false;
  } 

  if (game.phase == 1 && sq.house < 1) {
    sq.house++;
    addAlert(p.name + " hat ein Haus in der " + sq.name + " gekauft.");
  } else if (game.phase == 2 && sq.house < 2) {
	sq.house++;
    addAlert(p.name + " hat ein Haus in der " + sq.name + " gekauft.");
	payState(price - sq.houseprice);
	SOCKET_LIST[turn].emit('buyhouse2', false);
  }  else {
    return;
  }

  if (houseSum + 1 == 8) {
	  game.phase = 2;
	  for (var i in SOCKET_LIST) {
		SOCKET_LIST[i].emit("popup", "Phase 2 beginnt.");
	  }
  }

  payeachplayer(sq.houseprice, "Hauskauf");

  updateOwned();
  updateMoney();
	
}

function auctionHouse() {
	SOCKET_LIST[turn].emit("chooseProperty", player, square)
}

function auctionHouseP(propertyindex) {
	game.addPropertyToAuctionQueue(propertyindex);
	game.auction();
}

function sellHouse(index) {
	sq = square[index];
	p = player[sq.owner];

	sq.house--;
	addAlert(p.name + " hat ein Haus in der " + sq.name + " verkauft.");

	p.money += sq.houseprice;
	updateOwned();
	updateMoney();
}

function showStats(key=turn) {
	var HTML, sq, p;
	var mortgagetext,
	housetext;
	var write;
	HTML = "<table align='center'><tr>";

	for (var x = 1; x <= pcount; x++) {
		write = false;
		p = player[x];
		if (x == 5) {
			HTML += "</tr><tr>";
		}
		HTML += "<td class='statscell' id='statscell" + x + "' style='border: 2px solid " + p.color + "' ><div class='statsplayername'>" + p.name + "</div>";

		for (var i = 0; i < 12; i++) {
			sq = square[i];

			if (sq.owner == x) {
				mortgagetext = "",
				housetext = "";

				if (sq.mortgage) {
					mortgagetext = "title='Hypothek aufgenommen' style='color: grey;'";
				}

				if (!write) {
					write = true;
					HTML += "<table>";
				}

				if (sq.house > 0) {
					housetext += "<span style='float: right; font-weight: bold;'>" + sq.house + "&nbsp;x&nbsp;<img src='./client/images/house.png' alt='' title='House' class='house' style='float: none;' /></span>";
				}

				HTML += "<tr><td class='statscellcolor' style='background: " + sq.color + ";";

				HTML += "' onmouseover='showdeed(" + i + ");' onmouseout='hidedeed();'></td><td class='statscellname' " + mortgagetext + ">" + sq.name + housetext + "</td></tr>";
			}
		}

		if (!write) {
			HTML += p.name + " hat keine Grundstücke.";
		} else {
			HTML += "</table>";
		}

		HTML += "</td>";
	}
	HTML += "</tr></table><div id='titledeed'></div>";

  SOCKET_LIST[key].emit('showstats', HTML);
}

function showdeed(property, key=turn) {

	var sq = square[property];
  SOCKET_LIST[key].emit('showdeed', sq);
}

function buy() {
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

    SOCKET_LIST[turn].emit('show', "#landed", false);

	} else {
		popup("<p>" + p.name + ", du brauchst weitere " + (property.price - p.money) + " um " + property.name + " zu kaufen.</p>");
	}
}

function mortgage(index) {
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

  SOCKET_LIST[turn].emit('changeButton', "mortgagebutton", value, title);

	addAlert(p.name + " hat eine Hypothek auf " + sq.name + " für " + mortgagePrice + " aufgenommen.");
	updateOwned();
	updateMoney();

	return true;
}

function unmortgage(index) {
	var sq = square[index];
	var p = player[sq.owner];
	var mortgagePrice = sq.price;

	if (mortgagePrice > p.money || !sq.mortgage) {
		return false;
	}

	p.pay(mortgagePrice, 0);
	sq.mortgage = false;

  value = "Hypothek aufnehmen für " + mortgagePrice;
  title = "Hypothek auf " + sq.name + " für " + mortgagePrice + " aufnehmen.";

  SOCKET_LIST[turn].emit('changeButton', "mortgagebutton", value, title);

	addAlert(p.name + " hat die Hypothek für " + sq.name + " für " + unmortgagePrice + " zurückgezahlt.");
	updateOwned();
	return true;
}

function land(increasedRent) {

	var p = player[turn];
	var s = square[p.position];

  SOCKET_LIST[turn].emit('show', "#landed", true);
  SOCKET_LIST[turn].emit('setHTML', "landed", "Du bist auf " + s.name + " gelandet.");

	s.landcount++;
	addAlert(p.name + " ist auf " + s.name + " gelandet.");

	// Allow player to buy the property on which he landed.
	if (s.price !== 0 && s.owner === 0) {

		{
      SOCKET_LIST[turn].emit('setHTML', "landed", "<div>Du bist auf <a href='javascript:void(0);' onmouseover='showdeed(" + p.position + ");' onmouseout='hidedeed();' class='statscellcolor'>" + s.name + "</a> gelandet.<input type='button' onclick='buy();' value='Kaufe (" + s.price + ")' title='Kaufe " + s.name + " für " + s.houseprice + ".'/></div>");
		}
	}

	// Collect rent
	if (s.owner !== 0 && s.owner != turn) {
		var rent = 0;

		if (s.house === 1) {
			rent = s.rent;
		}
		
		addAlert(p.name + " hat " + rent + " Miete an " + player[s.owner].name + " gezahlt.");
		p.pay(rent, s.owner);
		player[s.owner].money += rent;

    SOCKET_LIST[turn].emit('setHTML', "landed", "Du bist auf " + s.name + " gelandet. " + player[s.owner].name + " hat " + rent + " Miete kassiert.");
	}

	updateMoney();
	updatePosition();
	updateOwned();

	chanceCommunityChest();
}

function chanceCommunityChest() {
	var p = player[turn];

	if (game.phase == 1) {
		// Chance
		if (p.position === 3 || p.position === 9) {
			var chanceIndex = chanceCards.deck[chanceCards.index];

			popup("<img src='./client/images/chance_icon.png' style='height: 50px; width: 26px; float: left; margin: 8px 8px 8px 0px;' /><div style='font-weight: bold; font-size: 16px; '>" + chanceCards[chanceIndex].title + "</div><div style='text-align: justify;'>" + chanceCards[chanceIndex].text + "</div>"); //TODO

		chanceAction(chanceIndex);

			chanceCards.index++;

			if (chanceCards.index >= chanceCards.deck.length) {
				chanceCards.index = 0;
			}
		}
	} else {
		// Chance
		if (p.position === 3 || p.position === 9) {
			if (chanceCards.index >= chanceCards2.deck.length) {
				chanceCards.index = 0;
			}

			var chanceIndex = chanceCards2.deck[chanceCards.index];

			popup("<img src='./client/images/chance_icon.png' style='height: 50px; width: 26px; float: left; margin: 8px 8px 8px 0px;' /><div style='font-weight: bold; font-size: 16px; '>" + chanceCards2[chanceIndex].title + "</div><div style='text-align: justify;'>" + chanceCards2[chanceIndex].text + "</div>");

		chanceAction(chanceIndex);

			chanceCards.index++;

			if (chanceCards.index >= chanceCards2.deck.length) {
				chanceCards.index = 0;
			}
		}
	}
	
}

function roll() {
	var p = player[turn];

  SOCKET_LIST[turn].emit('roll');
  SOCKET_LIST[turn].emit('changeButton', "nextbutton", "Spielzug beenden", "Spielzug beenden und zum nächsten Spieler wechseln.");

	game.rollDice();
	var die1 = game.getDie();

	addAlert(p.name + " hat " + die1 + " gewürfelt.");

	SOCKET_LIST[turn].emit('changeButton', "nextbutton", "Spielzug beenden", "Spielzug beenden und zum nächsten Spieler wechseln.");

	updatePosition();
	updateMoney();
	updateOwned();

	
	updateDice(die1);

	p_old = p.position;
	// Move player
	p.position += die1;

	// Pay interest as you pass GO
	if (p_old < 6 && p.position >= 6) {
		citytax();
	}
	if (p.position >= 12) {
		p.position -= 12;
		meineBank.zinsenLotto += Math.floor(p.sumKredit * game.zinssatz / 100);
		p.money -= Math.floor(p.sumKredit * game.zinssatz / 100);
		addAlert(p.name + " ist über Start gezogen und hat Zinsen auf Kredite gezahlt.");
	}

	land();
}

function play() {  
	percent = 0;
	discount = 0;
	turn++;
	if (turn > pcount) {
		turn -= pcount;
	}

	if (SOCKET_LIST[turn] == undefined) return;
  	SOCKET_LIST[turn].emit('show', "#nextbutton", true);

	var p = player[turn];
	game.resetDice();
  	SOCKET_LIST[turn].emit('setHTML', "pname", p.name);

	addAlert(p.name + " ist an der Reihe.");

	// Check for bankruptcy.
	p.pay(0, p.creditor);

  SOCKET_LIST[turn].emit('show', "#landed, #option, #manage", false);
  SOCKET_LIST[turn].emit('show', "#board, #control, #moneybar, #viewstats, #buy", true);

  SOCKET_LIST[turn].emit('focusbutton', "nextbutton");
  SOCKET_LIST[turn].emit('changeButton', "nextbutton", "Würfeln", "Würfeln und Figur entsprechend vorrücken.");

  SOCKET_LIST[turn].emit('show', "#die0", false);

	updateMoney();
	updatePosition();
	updateOwned();

	for (var i in SOCKET_LIST) {
		SOCKET_LIST[i].emit('show', ".money-bar-arrow", false);
  		SOCKET_LIST[i].emit('show', "#p" + turn + "arrow", true);
	}
}

function setup(isKapitalismus, playernumber, nieten) {
	pcount = playernumber;

	meinStaat = new Staat();
	meineBank = new Bank();

	for (var i = 0; i < 12; i++) {
		square[i].reset();
	}

	var playerArray = new Array(pcount);
	var p;

	playerArray.randomize();
	turn = playerArray[0] - 1;

	var colors = ["yellow", "red", "beige", "purple", "orange", "violet"]

	var properties = new Array(1,2,4,5,7,8,10,11);
	
	if (isKapitalismus) {
		for (i = 0; i < nieten; i++) {
			properties.push(-1);
		}
	}

	properties.sort(function() { return 0.5 - Math.random();});

	for (var i = 1; i <= pcount; i++) {

		p = player[playerArray[i - 1]];
		
		p.human = true;
		p.color = colors.shift();
		p.name = playerNames[playerArray[i - 1]] ? playerNames[playerArray[i - 1]] : 'Spieler ' + playerArray[i - 1];
		
		//Immobilienkarten verteilen

		if (!isKapitalismus) {
			var n = pcount <= 4 ? 2 : 1;
			for (var j = 0; j < n; j++) {
				var pos = properties.pop();
				var property = square[pos];

				property.owner = playerArray[i - 1];
				addAlert(p.name + " hat " + property.name + " erhalten.");

				//updateOwned();
			}
			p.update();
		}	

		
		//end:Immobilienkarten verteilen
	}

	if (isKapitalismus) {
		while (properties.length != 0) {
			for (var i = 1; i <= pcount; i++) {
				p = player[playerArray[i - 1]];
				var pos = properties.pop();
				if (pos == -1) {
					continue;
				}
				
				var property = square[pos];
				property.owner = playerArray[i - 1];
				addAlert(p.name + " hat " + property.name + " erhalten.");
				p.update();
			}
		}
	}

  for(var i in SOCKET_LIST){
    SOCKET_LIST[i].emit('show', "#control, #board, #moneybar", true);
    SOCKET_LIST[i].emit('show', "#setup, #nextbutton, #resignbutton", false);
  }  
	
	/*if (pcount === 3) {
		document.getElementById("stats").style.width = "686px";
	}

	document.getElementById("stats").style.top = "0px";
	document.getElementById("stats").style.left = "0px";*/

	play();
}

function popup(HTML, option, doMortgage, key=turn) {
  SOCKET_LIST[key].emit('popup', HTML, option, doMortgage);
}

function loadWindow() {
  game = new Game();

	for (var i = 0; i <= 6; i++) {
		player[i] = new Player("", "");
		player[i].index = i;
	}

	player[1].human = true;
	player[0].name = "Bank";

	chanceCards.index = 0;

	chanceCards.deck = [];
	chanceCards2.deck = [];

	for (var i = 0; i < 15; i++) {
		chanceCards.deck[i] = i;
	}

	for (var i = 0; i < 14; i++) {
		chanceCards2.deck[i] = i;
	}

	// Shuffle Chance and Community Chest decks.
	chanceCards.deck.sort(function() {return Math.random() - 0.5;});
	chanceCards2.deck.sort(function() {return Math.random() - 0.5;});

  for(var i in SOCKET_LIST){
    SOCKET_LIST[i].emit('setupsquares', square);
  }
}

//Start old code: classicedition.js

function Square(name, pricetext, color, rent, houseprice) {
	this.name = name;
	this.pricetext = pricetext;
	this.color = color;
	this.owner = 0;
	this.mortgage = false;
	this.mortgageHouse = false;
	this.house = 0;
	this.price = (houseprice || 0);
	this.rent = (rent || 0);
	this.landcount = 0;
	this.houseprice = (houseprice || 0);
	this.groupNumber = this.price != 0 ? 1 : 0
	this.reset = function() {
	  this.owner = 0;
	  this.mortgage = false;
	  this.mortgageHouse = false;
	  this.house = 0;
	  this.landcount = 0;
  	}
}

function Card(title, text, action) {
	this.title = title;
  this.text = text;
	this.action = action;
}

function citytax() {
	addAlert(player[turn].name + " ist auf oder über das Feld Staat/Finanzamt gezogen und Steuern aufs Guthaben gezahlt.");
	//TODO: ask to buy Vermögensgegenstände
	var steuer = Math.floor(0.1 * player[turn].money);
	player[turn].pay(steuer, 0);
	meinStaat.steuer += steuer;

	if (player[turn].color == "yellow") {
		for (var i = 0; i < pcount; i++) {
			player[i+1].money += Math.floor(player[i+1].anleihen * (game.zinssatz / 100));
			meinStaat.steuer -= Math.floor(player[i+1].anleihen * (game.zinssatz / 100));
		}
		meineBank.zinsenLotto += Math.floor(meineBank.anleihenBank * (game.zinssatz / 100));
		meinStaat.zinsenLotto -= Math.floor(meineBank.anleihenBank * (game.zinssatz / 100));

		addAlert(" Der Staat hat Zinsen auf alle Anleihen gezahlt.");
	}

	if (meinStaat.steuer < 0) {
		meineBank.geldMenge -= meinStaat.steuer;
		meineBank.buyAnleihen(meinStaat.steuer);
		meinStaat.staatsSchuld += meinStaat.steuer;
		meinStaat.steuer = 0;
	}

	//$("#landed").show().text("You landed on Staat/Finanzamt. Zahle 10% von Deinem Guthaben."); //TODO
}

var square = [];

square[0] = new Square("Start/Bank", "Wer auf oder über dieses Feld zieht, zahlt Zinsen für alle offenen Kredite.", "yellow");
square[1] = new Square("Kiesweg 1", "Miete:12.000", "rgb(255, 252, 92)", 12000, 36000);
square[2] = new Square("Kiesweg 2", "Miete:14.000", "rgb(255, 252, 92)", 14000, 42000);
square[3] = new Square("Ereignisfeld", "", "transparent");
square[4] = new Square("Alleenring 1", "Miete:22.000", "rgb(119, 248, 140)", 22000, 66000);
square[5] = new Square("Alleenring 2", "Miete:24.000", "rgb(119, 248, 140)", 24000, 72000);
square[6] = new Square("Staat/Finanzamt", "Wer auf oder über dieses Feld zieht, zahlt 10% Steuern aufs aktuelle Guthaben. Zieht Gelb auf oder über dieses Feld zahlt der Staat Zinsen auf alle Anleihen.", "yellow");
square[7] = new Square("Ziegelstraße 1", "Miete:16.000", "red", 16000, 48000);
square[8] = new Square("Ziegelstraße 2", "Miete:16.000", "red", 16000, 48000);
square[9] = new Square("Ereignisfeld", "", "transparent");
square[10] = new Square("Nasse Gasse 1", "Miete:18.000", "rgb(92, 195, 255)", 18000, 54000);
square[11] = new Square("Nasse Gasse 2", "Miete:18.000", "rgb(92, 195, 255)", 18000, 54000);

var chanceCards = [];

chanceCards[0] = new Card("TÜV","Dein Auto muss zum TÜV. Zahle 5.000 an die Werkstatt: Linke/r Mitspieler*in.", function() { payplayer(1, 5000);});
chanceCards[1] = new Card("Konsum","Du kaufst ein Motorrad. Überweise 8.000 an die Person rechts neben Dir.", function() { payplayer(-1, 8000);});
chanceCards[2] = new Card("Urlaub","Mache Urlaub im Umland. Überweise 6.000 anteilig an alle, da sie für Dich kochen, putzen, singen...", function() { payeachplayer(6000,"Ereignisfeld");});
chanceCards[3] = new Card("Lobbyarbeit","Der Besuch des Opernballs kostet Dich 3.000. Überweise an den Staat.", function() { payState(3000);});
chanceCards[4] = new Card("Geburtstag","Du hast einen runden Geburtstag. Die Party kostet 6.000. Überweise an alle Mitspieler*innen.", function() { payeachplayer(6000,"Ereignisfeld");});
chanceCards[5] = new Card("KFZ-Steuer","Zahle für Deinen Fahrzeugpark 4.000 Kfz-Steuer an den Staat.", function() { payState(4000);});
chanceCards[6] = new Card("Strafticket","Du musst Deine Fahrerlaubnis erneuern. Überweise 3.000 an den Staat.", function() { payState(3000);});
chanceCards[7] = new Card("Hauptgewinn","Glückwunsch! Du hast im Lotto gewonnen und erhältst das gesamte Bankguthaben als Gewinn.", function() { receiveBankguthaben();});
chanceCards[8] = new Card("Zuzahlung","Du warst zur Kur und musst 2.000 zuzahlen. Überweise an den Staat.", function() { payState(2000);});
chanceCards[9] = new Card("Banküberfall","Du hast die Bank überfallen und den Tresor geräumt. Die Bank überweist Dir ihr gesamtes Guthaben.", function() { receiveBankguthaben();});
chanceCards[10] = new Card("Finanzamt","Rücke direkt ins Finanzamt vor und zahle Steuern auf dein aktuelles Guthaben.", function() { advance(6);}); //TODO Du kannst vorher andere Geschäfte tätigen.
chanceCards[11] = new Card("Gebrauchtwagen", "Du verkaufst an die Person mit dem aktuell niedrigsten Saldo ein Auto. Lass Dir 4.000 überweisen. Kreditaufnahme für Kauf möglich.", function() { sellPoorest(4000);});
chanceCards[12] = new Card("Spende","Spende 10.000 für das Gemeinwohl. Überweise an den Staat.", function() { payState(10000);});
chanceCards[13] = new Card("GEMA","Die GEMA fordert 1.000 für die Musikbeschallung in deiner Firma. Überweise an den Staat.", function() { payState(1000);});
chanceCards[14] = new Card("Steuererstattung","Du bekommst 5.000 vom Finanzamt (Staat) erstattet.", function() { payState(-5000);});

var chanceCards2 = [];

chanceCards2[0] = new Card("Steuerforderung","Zahle 10.000 an den Staat.", function() { payState(10000);});
chanceCards2[1] = new Card("Konsum","Du verkaufst der/dem Reichsten eine Yacht für 40.000.", function() { sellRichest(40000);});
chanceCards2[2] = new Card("Wasserrohrbruch","Zahle für die Reparatur 8.000 an Deine*n rechte*n Mitspieler*in", function() { payplayer(-1, 8000);});
chanceCards2[3] = new Card("Studiengebühren","Deine Tochter macht ein Auslandssemester. Du unterstützt sie mit 15.000. Überweise an den Staat.", function() { payState(15000);});
chanceCards2[4] = new Card("Investitionsbeihilfe","Der Staat übernimmt 10% deiner Baukosten, wenn du ein 2. Haus auf eins Deiner Grundstücke baust. Du darfst keine Miete dafür erheben. Steuerbegünstigter Leerstand um Geld in Umlauf zu bringen! Du kannst Kredit aufnehmen.", function() { percent=10; SOCKET_LIST[turn].emit('buyhouse2', true); updateOption();});
chanceCards2[5] = new Card("Feuerschaden","Nach Hausbrand zahlt die Versicherung (Staat) 48.000. Du renovierst und überweist das Geld anteilig an alle.", function() { payState(-48000); payeachplayer(48000, "Ereignisfeld");});
chanceCards2[6] = new Card("Heizungsreparatur","Für die Reparatur bekommst du 10.000 von der Person rechts neben Dir.", function() { payplayer(-1, -10000);}); //TODO Zum Bezahlen kann außerplanmäßig ein Kredit aufgenommen werden.
chanceCards2[7] = new Card("Steuerfahndung","Dir wurde Steuerhinterziehung nachgewiesen. Überweise 50% Deines Guthabens an den Staat.", function(p) { payState(p.money * 0.5);});
//chanceCards2[8] = new Card("Fensterreparatur","Du hast im Haus auf diesem Feld die Fenster repariert. Der/die Eigentümer*in zahlt Dir 15.000. Dafür ist Kreditaufnahme möglich.", function() {}); //?
chanceCards2[8] = new Card("Feinstaubplaketten","Kaufe Plaketten für deinen Fahrzeugpark. Zahle 1.000 an den Staat.", function() { payState(1000);});
chanceCards2[9] = new Card("Investitionsbeihilfe","Wenn Du jetzt baust, zahlt der Staat 20.000 dazu. Du darfst ein 2. Haus auf eins Deiner Grundstücke bauen, aber keine Miete dafür erheben. Steuerbegünstigter Leerstand um Geld in Umlauf zu bringen! Du kannst Kredit aufnehmen.", function() { discount=20000; SOCKET_LIST[turn].emit('buyhouse2', true); updateOption();});
chanceCards2[10] = new Card("Hackerangriff","Du hast die Bank gehackt und 80.000 erpresst. Die Bank schöpft das Geld durch Emission von Derivaten.", function() { receiveFromBank(80000);});
chanceCards2[11] = new Card("Einbauküche","Du kaufst für 24.000 eine Einbauküche. Überweise den Betrag anteilig an alle Mitspieler*innen", function() { payeachplayer(24000, "Ereignisfeld");});
chanceCards2[12] = new Card("Erbstreit","Wegen eines Erbstreits musst Du ein Grundstück versteigern. Die Hälfte des Erlöses zahlst du anteilig an alle aus.", function() { auctionHouse();});
chanceCards2[13] = new Card("Beitragserhöhung","Deine Krankenkasse erhöht die Beiträge. Zahle 3.000 an den Staat.", function() { payState(3000);});
