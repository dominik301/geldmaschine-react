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

global.playerNo = 1;
global.playerNames = {};
global.gameRunning = false;

var io = require('socket.io')(server);
io.sockets.on('connection', function(socket){
  if (gameRunning) return;
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
  //delete player if inactive for at least 10 min
  var x = setInterval(function() {
	Object.keys(SOCKET_LIST).forEach(function eachKey(key) {
		if(SOCKET_LIST[key] == socket){
			if (gameRunning) {
				var p = player[key];
				if (p.active) {
					p.active = false;
					return;
				}
				socket.emit("popup", "Du warst längere Zeit inaktiv und wurdest aus dem Spiel entfernt.");
				game.eliminatePlayer(key);
			} else {
				socket.emit("popup", "Du warst längere Zeit inaktiv und wurdest aus dem Spiel entfernt.");
				playerNo -= 1;
				delete playerNames[key];
				delete SOCKET_LIST[key];

				for (var i = parseInt(key); i < playerNo; i++) {
					playerNames[i] = playerNames[i + 1];
					SOCKET_LIST[i] = SOCKET_LIST[i + 1];
					SOCKET_LIST[i].emit('setPlayerId', i);
				}
			}
			socket.disconnect()
		}
	});
  }, 1000*60*10);

  socket.on('setup', setup);

  socket.on('zinssatz', function(data) {
	game.zinssatz = parseInt(data);
	console.log('zinssatz changed to', game.zinssatz)
  })

  socket.on('next', function() {
	Object.keys(SOCKET_LIST).forEach(function eachKey(key) {
		if(SOCKET_LIST[key] == socket){
			var p = player[key];
			p.active = true;
		}
	});
	  game.next();
	});

  socket.on('resign', function() {game.resign()});

  socket.on('sozialhilfe', sozialHilfe);

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

  socket.on('eliminate', function() {game.eliminatePlayer});

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

  socket.on('newTrade', function(ini, rec, mon, pro, anl, der, ass) {
    game.tradeObj = new Trade(ini, rec, mon, pro, anl, der, ass);
    socket.emit('tradeObj', game.tradeObj);
  });

  socket.on('sendOffer', handleOffer);

  socket.on('changeOwner', function(sq_idx, rcp_idx) {
    square[sq_idx].owner = rcp_idx;
  })

  socket.on('transferAssets', function(ini_idx, rcp_idx, assets) {
	  var recipient = player[rcp_idx];
	  var initiator = player[ini_idx];
	if (assets.length == 3) {
		recipient.motorrad += assets[0]
		initiator.motorrad -= assets[0]
		if (assets[0] > 0) {
			addAlert(recipient.name + " hat Motorrad von " + initiator.name + " erhalten.");
		}
		else if (assets[0] < 0) {
			addAlert(initiator.name + " hat Motorrad von " + recipient.name + " erhalten.");
		}
		recipient.auto += assets[1]
		initiator.auto -= assets[1]
		if (assets[1] > 0) {
			addAlert(recipient.name + " hat Auto von " + initiator.name + " erhalten.");
		}
		else if (assets[1] < 0) {
			addAlert(initiator.name + " hat Auto von " + recipient.name + " erhalten.");
		}
		recipient.yacht += assets[2]
		initiator.yacht -= assets[2]
		if (assets[2] > 0) {
			addAlert(recipient.name + " hat Yacht von " + initiator.name + " erhalten.");
		}
		else if (assets[2] < 0) {
			addAlert(initiator.name + " hat Yacht von " + recipient.name + " erhalten.");
		}
	}
  });

  socket.on('buyDerivate', function(initiator, recipient, derivate) {
	var p = recipient == 0 ? meineBank : player[recipient];
	if (p instanceof Bank) {
		p.derivateBank += derivate;
	} else {
		p.derivate += derivate;
	}
	player[initiator].derivate -= derivate;
  });

  socket.on('buyAnleihen', function(initiator, recipient, anleihen) {
	var p = recipient == 0 ? meineBank : player[recipient];
	if (p instanceof Bank) {
		p.anleihenBank += anleihen;
	} else {
		p.anleihen += anleihen;
	}
	player[initiator].anleihen -= anleihen;
  });

  socket.on("newbid", function(highestbidder,highestbid) {
	game.highestbidder = highestbidder;
	game.highestbid = highestbid;
	transactionFunctions.bid();
  });

  socket.on("auctionExit", function(currentbidder) {
	player[currentbidder].bidding = false;
  });

  socket.on("finalizeAuction", function() {game.finalizeAuction});

  socket.on("auctionHouse", auctionHouseP);

  socket.on('disconnect',function(){
	Object.keys(SOCKET_LIST).forEach(function eachKey(key) {
		if(SOCKET_LIST[key] == socket){
			if (gameRunning) {
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

  socket.on('addAlert', addAlert);
	
});

//
var port = process.env.PORT || 3000;
//var port = process.argv[2] == undefined ? 4141 : process.argv[2];
server.listen(port) //, "0.0.0.0");

//Start: Old code monopoly.js

var Game = require('./Game');

global.game;

var Player = require('./Player');
var Bank = require('./Bank');
var Staat = require('./Staat');

// paramaters:
// initiator: object Player
// recipient: object Player
// money: integer, positive for offered, negative for requested
// property: array of integers, length: 40

var Trade = require('./Trade');

global.player = [];
global.pcount;
global.turn = 0;
var meinStaat = new Staat();
global.meineBank = new Bank();

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

global.addAlert = function addAlert(alertText) {
	for(var i in SOCKET_LIST){
    SOCKET_LIST[i].emit('addAlert', alertText);
  }
}


function updatePosition() {
  for (var i in SOCKET_LIST) {
    SOCKET_LIST[i].emit("updatePosition", square, turn, player);
  }
}

global.updateMoney = function updateMoney() {
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

global.updateOwned = function updateOwned() {
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

	if (!p.human) {
		game.next();
	}
}


global.payeachplayer = function payeachplayer(amount, cause) {
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
			var kreditZinsen = Math.floor(p.sumKredit * game.zinssatz / 100);
			meineBank.zinsenLotto += kreditZinsen
			p.pay(kreditZinsen, 0);
			if (p.money < 0) {
				var dispoZinsen = Math.floor(-p.money * game.dispoZinssatz / 100);
				meineBank.zinsenLotto += dispoZinsen
				p.pay(dispoZinsen, 0);
			}
			addAlert(p.name + " ist über Start gezogen und hat Zinsen auf Kredite gezahlt.");
		}
	}
	if (p.position < destination) {
		p.position = destination;
	} else {
		p.position = destination;
		var kreditZinsen = Math.floor(p.sumKredit * game.zinssatz / 100);
		meineBank.zinsenLotto += kreditZinsen
		p.pay(kreditZinsen, 0);
		if (p.money < 0) {
			var dispoZinsen = Math.floor(-p.money * game.dispoZinssatz / 100);
			meineBank.zinsenLotto += dispoZinsen
			p.pay(dispoZinsen, 0);
		}
		addAlert(p.name + " ist über Start gezogen und hat Zinsen auf Kredite gezahlt.");
	}

	land();
}

var transactionFunctions = require('./transactionFunctions')

var payplayer = transactionFunctions.payplayer;

function payState(amount, reason="") {
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
		addAlert(p.name + " hat " + (-amount) + reason + " vom Staat erhalten.");
	} else {
		addAlert(p.name + " hat " + amount + " an den Staat gezahlt.");
	}
}

global.sozialHilfe = function sozialHilfe(key=turn) {
	var p = player[key];
	var amount = p.money - p.sumKredit + p.verfuegbareHypothek;
	payState(amount, " Sozialhilfe");
}

var sellRichest = transactionFunctions.sellRichest;
var sellPoorest = transactionFunctions.sellPoorest;
var receiveFromBank = transactionFunctions.receiveFromBank;
var receiveBankguthaben = transactionFunctions.receiveBankguthaben;

percent = 0;
discount = 0;

global.buyHouse = function buyHouse(index) {

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
	if (SOCKET_LIST[turn])
		SOCKET_LIST[turn].emit('buyhouse2', false);
	else {
		return;
	}
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
	if (player[turn].human) {
		SOCKET_LIST[turn].emit("chooseProperty", player, square)
	} else {
		// choose property at random
		var properties = new Array();
		for (var i in square) {
			if (square[i].owner == turn) {
				properties.push(i);
			}
		}
		if (properties.length == 0) return;
		properties.sort(function() { return 0.5 - Math.random();});
		auctionHouseP(properties.pop())
	}

}

function auctionHouseP(propertyindex) {
	game.addPropertyToAuctionQueue(propertyindex);
	game.auction();
}

var handleOffer = transactionFunctions.handleOffer;

var sellHouse = transactionFunctions.sellHouse;
var showStats = require('./showStats');

function showdeed(property, key=turn) {

	var sq = square[property];
  SOCKET_LIST[key].emit('showdeed', sq);
}

var buy = transactionFunctions.buy;
var mortgage = transactionFunctions.buy;

global.unmortgage = function unmortgage(index) {
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

  	if (p.human) SOCKET_LIST[turn].emit('changeButton', "mortgagebutton", value, title);

	addAlert(p.name + " hat die Hypothek für " + sq.name + " für " + unmortgagePrice + " zurückgezahlt.");
	updateOwned();
	return true;
}

function land(increasedRent) {

	var p = player[turn];
	var s = square[p.position];

	if (p.human) {
		SOCKET_LIST[turn].emit('show', "#landed", true);
		SOCKET_LIST[turn].emit('setHTML', "landed", "Du bist auf " + s.name + " gelandet.");
	}
	
	s.landcount++;
	addAlert(p.name + " ist auf " + s.name + " gelandet.");

	// Allow player to buy the property on which he landed.
	if (s.price !== 0 && s.owner === 0) {
		if (!p.human) {
			if (p.AI.buyProperty(p.position)) {
				buy();
			}
		} else {
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

    	if (p.human) SOCKET_LIST[turn].emit('setHTML', "landed", "Du bist auf " + s.name + " gelandet. " + player[s.owner].name + " hat " + rent + " Miete kassiert.");
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

			popupAll("<img src='./client/images/chance_icon.png' style='height: 50px; width: 26px; float: left; margin: 8px 8px 8px 0px;' /><div style='font-weight: bold; font-size: 16px; '>" + chanceCards[chanceIndex].title + "</div><div style='text-align: justify;'>" + chanceCards[chanceIndex].text + "</div>"); //TODO

			chanceAction(chanceIndex);

			chanceCards.index++;

			if (chanceCards.index >= chanceCards.deck.length) {
				chanceCards.index = 0;
			}
		} else if (!p.human) {
			if (!p.AI.onLand()) {
				game.next();
			}
		}
	} else {
		// Chance
		if (p.position === 3 || p.position === 9) {
			if (chanceCards.index >= chanceCards2.deck.length) {
				chanceCards.index = 0;
			}

			var chanceIndex = chanceCards2.deck[chanceCards.index];

			popupAll("<img src='./client/images/chance_icon.png' style='height: 50px; width: 26px; float: left; margin: 8px 8px 8px 0px;' /><div style='font-weight: bold; font-size: 16px; '>" + chanceCards2[chanceIndex].title + "</div><div style='text-align: justify;'>" + chanceCards2[chanceIndex].text + "</div>");

			chanceAction(chanceIndex);

			chanceCards.index++;

			if (chanceCards.index >= chanceCards2.deck.length) {
				chanceCards.index = 0;
			}
		} else if (!p.human) {
			if (!p.AI.onLand()) {
				game.next();
			}
		}
	}
}

var timePassed = false;

global.roll = function roll() {
	var p = player[turn];

	if (p == undefined) return;

	if (!p.human && !timePassed) {
		setTimeout(() => { roll();}, 2000);
		timePassed = true;
		return;
	}

	timePassed = false;

	if (p.human) {
		SOCKET_LIST[turn].emit('roll');
  		SOCKET_LIST[turn].emit('changeButton', "nextbutton", "Spielzug beenden", "Spielzug beenden und zum/zur nächsten SpielerIn wechseln.");
	}
  
	game.rollDice();
	var die1 = game.getDie();

	addAlert(p.name + " hat " + die1 + " gewürfelt.");

	if (p.human) SOCKET_LIST[turn].emit('changeButton', "nextbutton", "Spielzug beenden", "Spielzug beenden und zum/zur nächsten SpielerIn wechseln.");

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
		var kreditZinsen = Math.floor(p.sumKredit * game.zinssatz / 100);
		meineBank.zinsenLotto += kreditZinsen
		p.pay(kreditZinsen, 0);
		if (p.money < 0) {
			var dispoZinsen = Math.floor(-p.money * game.dispoZinssatz / 100);
			meineBank.zinsenLotto += dispoZinsen
			p.pay(dispoZinsen, 0);
		}
		
		addAlert(p.name + " ist über Start gezogen und hat Zinsen auf Kredite gezahlt.");
	}

	land();
}

global.play = function play() {  

	if (player[turn].human && player[turn].money < 0) {
		popup("<p>Du hast dein Konto um " + (-player[turn].money) + " überzogen. Nimm einen Kredit auf, um Dispo-Zinsen zu vermeiden.</p>")
	}

	percent = 0;
	discount = 0;
	turn++;
	if (turn > pcount) {
		turn -= pcount;
	}

	if (SOCKET_LIST[turn] == undefined && player[turn].AI == null) return;
	
	var p = player[turn];
	game.resetDice();
	if (p.human) {
		SOCKET_LIST[turn].emit('show', "#nextbutton", true);
		SOCKET_LIST[turn].emit('setHTML', "pname", p.name);
	}
	addAlert(p.name + " ist an der Reihe.");

	// Check for bankruptcy.
	p.pay(0, p.creditor);

	if (p.human) {
		SOCKET_LIST[turn].emit('show', "#landed, #option, #manage", false);
		SOCKET_LIST[turn].emit('show', "#board, #control, #moneybar, #viewstats, #buy", true);

		SOCKET_LIST[turn].emit('focusbutton', "nextbutton");
		SOCKET_LIST[turn].emit('changeButton', "nextbutton", "Würfeln", "Würfeln und Figur entsprechend vorrücken.");

		SOCKET_LIST[turn].emit('show', "#die0", false);
	}

	updateMoney();
	updatePosition();
	updateOwned();

	for (var i in SOCKET_LIST) {
		SOCKET_LIST[i].emit('show', ".money-bar-arrow", false);
  		SOCKET_LIST[i].emit('show', "#p" + turn + "arrow", true);
	}

	if (!p.human) {
		if (!p.AI.beforeTurn()) {
			game.next();
		}
	}
}

function setup(isKapitalismus, playernumber, nieten) {
	pcount = parseInt(playernumber);

	meinStaat = new Staat();
	meineBank = new Bank();

	for (var i = 0; i < 12; i++) {
		square[i].reset();
	}

	var playerArray = new Array(pcount);
	var p;

	playerArray.randomize();
	turn = playerArray[0] - 1;

	var colors = ["gold", "red", "beige", "purple", "orange", "violet"];
	var aiNames = new Array("Dirk (KI)", "Anna (KI)", "Julia (KI)", "Nicole (KI)", "Michael (KI)");

	var properties = new Array(1,2,4,5,7,8,10,11);
	
	if (isKapitalismus) {
		for (i = 0; i < nieten; i++) {
			properties.push(-1);
		}
	}

	properties.sort(function() { return 0.5 - Math.random();});
	aiNames.sort(function() { return 0.5 - Math.random();});

	for (var i = 1; i <= pcount; i++) {

		p = player[playerArray[i - 1]];
		
		// player is human
		if (playerArray[i - 1] < playerNo) {
			p.human = true;
			p.color = colors.shift();
			p.name = playerNames[playerArray[i - 1]] ? playerNames[playerArray[i - 1]] : 'SpielerIn ' + playerArray[i - 1];
		} else {	//player is AI
			p.human = false;
			p.AI = new AITest(p);
			p.color = colors.shift();
			p.name = aiNames.pop();
		}
		
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
			for (var i = 2; i <= pcount; i++) {
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
    SOCKET_LIST[i].emit('show', "#setup, #nextbutton, #resignbutton, #creditbutton", false);
  }  
	
	/*if (pcount === 3) {
		document.getElementById("stats").style.width = "686px";
	}

	document.getElementById("stats").style.top = "0px";
	document.getElementById("stats").style.left = "0px";*/

	play();
}

global.popup = function popup(HTML, option, doMortgage, key=turn) {
	if (!player[key].human) return;
  	SOCKET_LIST[key].emit('popup', HTML, option, doMortgage);
}

function popupAll(HTML, option, doMortgage) {
	for (var i in SOCKET_LIST) {
		SOCKET_LIST[i].emit('popup', HTML, option, doMortgage);
	}
}

function loadWindow() {
  	game = new Game();
	gameRunning = true

	for (var i = 0; i <= 6; i++) {
		player[i] = new Player("", "");
		player[i].index = i;
	}

	AITest.count = 0;

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

var Card = require('./Card');

function citytax() {
	addAlert(player[turn].name + " ist auf oder über das Feld Staat/Finanzamt gezogen und Steuern aufs Guthaben gezahlt.");
	//TODO: ask to buy Vermögensgegenstände
	var steuer = Math.floor(0.1 * player[turn].money);
	player[turn].pay(steuer, 0);
	meinStaat.steuer += steuer;

	if (player[turn].color == "gold") {
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

global.square = require('./Square.js').square;

var chanceCards = [];

chanceCards[0] = new Card("TÜV","Dein Auto muss zum TÜV. Zahle 5.000 an die Werkstatt: Linke/r Mitspieler*in.", function() { payplayer(1, 5000);});
chanceCards[1] = new Card("Konsum","Du kaufst ein Motorrad. Überweise 8.000 an die Person rechts neben Dir.", function() { payplayer(-1, 8000); assets.push(new Asset("Motorrad", player[turn].motorrad += 1));});
chanceCards[2] = new Card("Urlaub","Mache Urlaub im Umland. Überweise 6.000 anteilig an alle, da sie für Dich kochen, putzen, singen...", function() { payeachplayer(6000,"Ereignisfeld");});
chanceCards[3] = new Card("Lobbyarbeit","Der Besuch des Opernballs kostet Dich 3.000. Überweise an den Staat.", function() { payState(3000);});
chanceCards[4] = new Card("Geburtstag","Du hast einen runden Geburtstag. Die Party kostet 6.000. Überweise an alle Mitspieler*innen.", function() { payeachplayer(6000,"Ereignisfeld");});
chanceCards[5] = new Card("KFZ-Steuer","Zahle für Deinen Fahrzeugpark 4.000 Kfz-Steuer an den Staat.", function() { payState(4000);});
chanceCards[6] = new Card("Strafticket","Du musst Deine Fahrerlaubnis erneuern. Überweise 3.000 an den Staat.", function() { payState(3000);});
chanceCards[7] = new Card("Hauptgewinn","Glückwunsch! Du hast im Lotto gewonnen und erhältst das gesamte Bankguthaben als Gewinn.", function() { receiveBankguthaben();});
chanceCards[8] = new Card("Zuzahlung","Du warst zur Kur und musst 2.000 zuzahlen. Überweise an den Staat.", function() { payState(2000);});
chanceCards[9] = new Card("Banküberfall","Du hast die Bank überfallen und den Tresor geräumt. Die Bank überweist Dir ihr gesamtes Guthaben.", function() { receiveBankguthaben();});
chanceCards[10] = new Card("Finanzamt","Rücke direkt ins Finanzamt vor und zahle Steuern auf dein aktuelles Guthaben.", function() { advance(6);}); //TODO Du kannst vorher andere Geschäfte tätigen.
chanceCards[11] = new Card("Gebrauchtwagen", "Du verkaufst an die Person mit dem aktuell niedrigsten Saldo ein Auto. Lass Dir 4.000 überweisen. Kreditaufnahme für Kauf möglich.", function() { var _p = sellPoorest(4000); player[_p].auto += 1;});
chanceCards[12] = new Card("Spende","Spende 10.000 für das Gemeinwohl. Überweise an den Staat.", function() { payState(10000);});
chanceCards[13] = new Card("GEMA","Die GEMA fordert 1.000 für die Musikbeschallung in deiner Firma. Überweise an den Staat.", function() { payState(1000);});
chanceCards[14] = new Card("Steuererstattung","Du bekommst 5.000 vom Finanzamt (Staat) erstattet.", function() { payState(-5000);});

var chanceCards2 = [];

chanceCards2[0] = new Card("Steuerforderung","Zahle 10.000 an den Staat.", function() { payState(10000);});
chanceCards2[1] = new Card("Konsum","Du verkaufst der/dem Reichsten eine Yacht für 40.000.", function() { sellRichest(40000); player[turn].yacht += 1;});
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

var AITest = require('./AI.js');
const { kMaxLength } = require('node:buffer');
