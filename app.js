var express = require('express');
const { title } = require('node:process');
var app = express();

/*const fs = require('fs');
 
const options = {
	key: fs.readFileSync('key.pem'), 
	cert: fs.readFileSync('cert.pem')
};

var server = require('https').createServer(options, app);*/
var server = require('http').createServer(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
app.use('/.well-known',express.static(__dirname + '/.well-known'));
app.use('/sw.js',express.static(__dirname + '/sw.js'));

console.log("Server started.");

SOCKET_LIST = {};

var playerNo = 1;
var playerNames = {};

var socket2game = {};

var io = require('socket.io')(server);
io.sockets.on('connection', function(socket){
  //if (gameRunning) return;
  console.log('new user!');

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
	let game = socket2game[socket.id];
	if (game != null && game.gameRunning) {
		Object.keys(game.SOCKET_LIST).forEach(function eachKey(key) {
			if(game.SOCKET_LIST[key] == socket){
				var p = game.player[key];
				if (p.active) {
					p.active = false;
					return;
				}
				socket.emit("popup", "Du warst längere Zeit inaktiv und wurdest aus dem Spiel entfernt.");
				game.eliminatePlayer(key);
				
				socket.disconnect()
			}
		});
	}
	Object.keys(SOCKET_LIST).forEach(function eachKey(key) {
		if(SOCKET_LIST[key] == socket){
			
			socket.emit("popup", "Du warst längere Zeit inaktiv und wurdest aus dem Spiel entfernt.");
			playerNo -= 1;
			delete playerNames[key];
			delete SOCKET_LIST[key];

			for (var i = parseInt(key); i < playerNo; i++) {
				playerNames[i] = playerNames[i + 1];
				SOCKET_LIST[i] = SOCKET_LIST[i + 1];
				SOCKET_LIST[i].emit('setPlayerId', i);
			}
			
			socket.disconnect()
		}
	});
  }, 1000*60*10);

  socket.on('setup', setup);

  socket.on('zinssatz', function(data) {
	let game = socket2game[socket.id];
	game.zinssatz = parseInt(data);
	console.log('zinssatz changed to', game.zinssatz)
  })

  socket.on('next', function() {
	let game = socket2game[socket.id];
	Object.keys(game.SOCKET_LIST).forEach(function eachKey(key) {
		if(game.SOCKET_LIST[key] == socket){
			var p = game.player[key];
			p.active = true;
		}
	});
	  game.next();
	});

  socket.on('resign', function() {
	let game = socket2game[socket.id];
	  game.resign()
	});

  socket.on('sozialhilfe', function() {
	let game = socket2game[socket.id];
	  sozialHilfe(game,game.turn);
	});

  socket.on('buyhouse',function(checkedProperty){
	let game = socket2game[socket.id];
    Object.keys(game.SOCKET_LIST).forEach(function eachKey(key) {
		if(game.SOCKET_LIST[key] == socket && key != game.turn){
			socket.emit('popup', game.player[key]. name + ", du bist nicht an der Reihe!");
			return;
		}
		else if (game.SOCKET_LIST[key] == socket){
			buyHouse(game,checkedProperty);  
		}
	});
  });

  socket.on('mortgage',function(checkedProperty){
	let game = socket2game[socket.id];
	for (var key in game.SOCKET_LIST) {
		if(game.SOCKET_LIST[key] == socket && key != game.turn){
			socket.emit('popup', game.player[key]. name + ", du bist nicht an der Reihe!");
			return;
		}
	}

    var s = game.square[checkedProperty];

    if (s.mortgage) {
        if (game.player[s.owner].money < s.houseprice) {
            game.popup("<p>Du brauchst " + (s.price - game.player[s.owner].money) + " mehr um die Hypothek für " + s.name + " zurückzuzahlen.</p>");

        } else {
            game.popup("<p>" + game.player[s.owner].name + ", möchtest du wirklich die Hypothek für " + s.name + " für " + s.price + " zurückzahlen?</p>", "Ja/Nein", true);
        }
    } else {
        game.popup("<p>" + game.player[s.owner].name + ", mächstest du wirkliche eine Hypothek für " + s.name + " für " + s.price + " aufnehmen?</p>", "Ja/Nein", true);
    } 
  });

  socket.on('doMortgage', function (checkedProperty){
	let game = socket2game[socket.id];
    var s = game.square[checkedProperty];

    if (s.mortgage) {
      unmortgage(game, checkedProperty);
    } else {
      tf.mortgage(game, checkedProperty);        
    } 
  });

  socket.on('sellhouse',function(checkedProperty){
	let game = socket2game[socket.id];
	for (var key in game.SOCKET_LIST) {
		if(game.SOCKET_LIST[key] == socket && key != turn){
			socket.emit('popup', game.player[key].name + ", du bist nicht an der Reihe!");
			return;
		}
	}
    tf.sellHouse(game,checkedProperty);        
  });

  socket.on('kreditaufnehmen',function(data){
	let game = socket2game[socket.id];
	Object.keys(game.SOCKET_LIST).forEach(function eachKey(key) {
		if(game.SOCKET_LIST[key] == socket){
			game.kreditAufnehmen(parseInt(data), key);
		}
	});
  });

  socket.on('kredittilgen',function(data){
	let game = socket2game[socket.id];
	Object.keys(game.SOCKET_LIST).forEach(function eachKey(key) {
		if(game.SOCKET_LIST[key] == socket){
			game.kreditTilgen(parseInt(data), key);
		}
	});    
  });

  socket.on('eliminate', function() {
	let game = socket2game[socket.id];
	  game.eliminatePlayer();
	});

  socket.on('updateOwned', function() {
	let game = socket2game[socket.id];
	  game.updateOwned();
  });

  socket.on('updateMoney', function() {
	let game = socket2game[socket.id];
	  game.updateMoney();
	});

  socket.on('updateOption', function() {
	let game = socket2game[socket.id];
	  game.updateOption();
});

  socket.on('showstats', function() {
	let game = socket2game[socket.id];
	Object.keys(game.SOCKET_LIST).forEach(function eachKey(key) {
		if(game.SOCKET_LIST[key] == socket){
			let showStats = require('./showStats')
			showStats(game,key);
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
	let game = socket2game[socket.id];
	Object.keys(game.SOCKET_LIST).forEach(function eachKey(key) {
		if(game.SOCKET_LIST[key] == socket){
			game.showdeed(property, key);
		}
	});
  })

  socket.on('updateSquare', function() {
	let game = socket2game[socket.id];
    socket.emit('updateSquare', game.square);
  });

  socket.on('updatePlayer', function() {
	let game = socket2game[socket.id];
    socket.emit('updatePlayer', game.player, game.meineBank);
  });

  socket.on('newTrade', function(ini, rec, mon, pro, anl, der, ass) {
	let game = socket2game[socket.id];
    game.tradeObj = new Trade(ini, rec, mon, pro, anl, der, ass);
    socket.emit('tradeObj', game.tradeObj);
  });

  socket.on('sendOffer', function() {
	let game = socket2game[socket.id];
	  tf.handleOffer(game);
  });

  socket.on('changeOwner', function(sq_idx, rcp_idx) {
	let game = socket2game[socket.id];
    game.square[sq_idx].owner = rcp_idx;
  })

  socket.on('transferAssets', function(ini_idx, rcp_idx, assets) {
	let game = socket2game[socket.id];
	  var recipient = game.player[rcp_idx];
	  var initiator = game.player[ini_idx];
	if (assets.length == 3) {
		recipient.motorrad += assets[0]
		initiator.motorrad -= assets[0]
		if (assets[0] > 0) {
			game.addAlert(recipient.name + " hat Motorrad von " + initiator.name + " erhalten.");
		}
		else if (assets[0] < 0) {
			game.addAlert(initiator.name + " hat Motorrad von " + recipient.name + " erhalten.");
		}
		recipient.auto += assets[1]
		initiator.auto -= assets[1]
		if (assets[1] > 0) {
			game.addAlert(recipient.name + " hat Auto von " + initiator.name + " erhalten.");
		}
		else if (assets[1] < 0) {
			game.addAlert(initiator.name + " hat Auto von " + recipient.name + " erhalten.");
		}
		recipient.yacht += assets[2]
		initiator.yacht -= assets[2]
		if (assets[2] > 0) {
			game.addAlert(recipient.name + " hat Yacht von " + initiator.name + " erhalten.");
		}
		else if (assets[2] < 0) {
			game.addAlert(initiator.name + " hat Yacht von " + recipient.name + " erhalten.");
		}
	}
  });

  socket.on('buyDerivate', function(initiator, recipient, derivate) {
	let game = socket2game[socket.id];
	var p = recipient == 0 ? game.meineBank : game.player[recipient];
	if (p instanceof Bank) {
		p.derivateBank += derivate;
	} else {
		p.derivate += derivate;
	}
	game.player[initiator].derivate -= derivate;
  });

  socket.on('buyAnleihen', function(initiator, recipient, anleihen) {
	let game = socket2game[socket.id];
	var p = recipient == 0 ? game.meineBank : game.player[recipient];
	if (p instanceof Bank) {
		p.anleihenBank += anleihen;
	} else {
		p.anleihen += anleihen;
	}
	game.player[initiator].anleihen -= anleihen;
  });

  socket.on("newbid", function(highestbidder,highestbid) {
	let game = socket2game[socket.id];
	game.highestbidder = highestbidder;
	game.highestbid = highestbid;
	tf.bid(game);
  });

  socket.on("auctionExit", function(currentbidder) {
	let game = socket2game[socket.id];
	game.player[currentbidder].bidding = false;
  });

  socket.on("finalizeAuction", function() {
	let game = socket2game[socket.id];
	  game.finalizeAuction();
	});

  socket.on("auctionHouse", function() {
	let game = socket2game[socket.id];
	  auctionHouse(game);
	});

  socket.on('disconnect',function(){
	let game = socket2game[socket.id];
	if (game != null && game.gameRunning) {
		Object.keys(game.SOCKET_LIST).forEach(function eachKey(key) {
			if(game.SOCKET_LIST[key] == socket){
				game.eliminatePlayer(key);
				return;
			}
		});
	}
	Object.keys(SOCKET_LIST).forEach(function eachKey(key) {
		if(SOCKET_LIST[key] == socket){
			playerNo -= 1;
			delete playerNames[key];
			delete SOCKET_LIST[key];

			for (var i = parseInt(key); i < playerNo; i++) {
				playerNames[i] = playerNames[i + 1];
				SOCKET_LIST[i] = SOCKET_LIST[i + 1];
				SOCKET_LIST[i].emit('setPlayerId', i);
			}
			delete playerNames[playerNo];
			delete SOCKET_LIST[playerNo];
		}
	});
  });

  socket.on('pay', function(initiator, recipient, money) {
	  let game = socket2game[socket.id];
	p1 = game.player[initiator.index]
	p2 = game.player[recipient.index]

	p1.pay(money, recipient.index);
    p2.money += money;
  })

  socket.on('buy', function() {
	let game = socket2game[socket.id];
	Object.keys(game.SOCKET_LIST).forEach(function eachKey(key) {
		if(game.SOCKET_LIST[key] == socket && key == game.turn){
			tf.buy(game);
		}
	});
  });

  socket.on('addAlert', function() {
	let game = socket2game[socket.id];
	  game.addAlert();
	});
	
});

//
var port = process.env.PORT || 3000;
//var port = process.argv[2] == undefined ? 4141 : process.argv[2];
server.listen(port) //, "0.0.0.0");

//Start: Old code monopoly.js

var Game = require('./Game');
var games = [];
var game;

var Player = require('./Player');
var Bank = require('./Bank');
var Trade = require('./Trade');


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

function chanceAction(game, chanceIndex) {
	var p = game.player[game.turn]; // This is needed for reference in action() method.

	if (game.phase == 1)
		chanceCards[chanceIndex].action(game);
	else
		chanceCards2[chanceIndex].action(game);

	game.updateMoney();

	if (!p.human) {
		setTimeout(() => { game.next();}, 5000);
	}
}


global.payeachplayer = function payeachplayer(game, amount, cause) {
	var p = game.player[game.turn];
	var total = 0;

	amount = Math.floor(amount / (game.pcount - 1));

	for (var i = 1; i <= game.pcount; i++) {
		if (i != game.turn) {
			game.player[i].money += amount;
			total += amount;
			creditor = p.money >= 0 ? i : creditor;

			p.pay(amount, creditor);
		}
	}
	if (cause == "Hauskauf")
		{game.addAlert(p.name + " hat für " + total + " ein Haus gekauft.");}
	else
		{game.addAlert(p.name + " hat " + total + " durch " + cause + " verloren.");}
}

var tf = require('./transactionFunctions')

global.payState = function payState(game, amount, reason="") {
	var p = game.player[game.turn];

	game.meinStaat.steuer += amount;

	if (game.meinStaat.steuer < 0) {
		if (game.phase = 1) {
			game.phase = 2;
			game.popupAll("Phase 2 beginnt.");
		}
		game.meineBank.geldMenge -= game.meinStaat.steuer;
		game.meineBank.buyAnleihen(-game.meinStaat.steuer);
		game.meinStaat.staatsSchuld += game.meinStaat.steuer;
		game.meinStaat.steuer = 0;
	}

	p.pay(amount, 0);
	if (amount < 0) {
		game.addAlert(p.name + " hat " + (-amount) + reason + " vom Staat erhalten.");
	} else {
		game.addAlert(p.name + " hat " + amount + " an den Staat gezahlt.");
	}
}

global.sozialHilfe = function sozialHilfe(game, key) {
	var p = game.player[key];
	var amount = p.money - p.sumKredit + p.verfuegbareHypothek;
	payState(game, amount, " Sozialhilfe");
}

global.buyHouse = function buyHouse(game, index) {

	var sq = game.square[index];
	var p = game.player[sq.owner];

  var houseSum = 0;

  price = (sq.houseprice - game.discount) * (1 - game.percent / 100);

  if (p.money < price) {
    game.popup("<p>Du brauchst " + (price - game.player[sq.owner].money) + " mehr um ein Haus in der " + sq.name + " zu kaufen.</p>");
    return false;
  }

  for (var i = 0; i < 12; i++) {
      houseSum += game.square[i].house;
  }

  if (sq.house < 2 && houseSum >= 11) {
	game.popup("<p>Alle 11 Häuser sind verkauft.</p>");
      return false;
  } 

  if (game.phase == 1 && sq.house < 1) {
    sq.house++;
    game.addAlert(p.name + " hat ein Haus in der " + sq.name + " gekauft.");
  } else if (game.phase == 2 && sq.house < 2) {
	sq.house++;
    game.addAlert(p.name + " hat ein Haus in der " + sq.name + " gekauft.");
	payState(game, price - sq.houseprice);
	if (!game.socketUndefined())
		game.buyHouse2(false);
	else {
		return;
	}
  }  else {
    return;
  }

  payeachplayer(game, sq.houseprice, "Hauskauf");

  game.updateOwned();
  game.updateMoney();
	
}

global.auctionHouse = function auctionHouse(game) {
	if (game.player[game.turn].human) {
		game.chooseProperty();
	} else {
		// choose property at random
		var properties = new Array();
		for (var i in game.square) {
			if (game.square[i].owner == turn) {
				properties.push(i);
			}
		}
		if (properties.length == 0) return;
		properties.sort(function() { return 0.5 - Math.random();});
		game.addPropertyToAuctionQueue(properties.pop());
		game.auction();
	}

}

global.unmortgage = function unmortgage(game, index) {
	var sq = game.square[index];
	var p = game.player[sq.owner];
	var mortgagePrice = sq.price;

	if (mortgagePrice > p.money || !sq.mortgage) {
		return false;
	}

	p.pay(mortgagePrice, 0);
	sq.mortgage = false;

  	let value = "Hypothek aufnehmen für " + mortgagePrice;
  	let title = "Hypothek auf " + sq.name + " für " + mortgagePrice + " aufnehmen.";

  	if (p.human) game.changeButton("mortgagebutton", value, title);

	game.addAlert(p.name + " hat die Hypothek für " + sq.name + " für " + unmortgagePrice + " zurückgezahlt.");
	game.updateOwned();
	return true;
}

global.land = function land(game) {

	var p = game.player[game.turn];
	var s = game.square[p.position];

	if (p.human) {
		game.show("#landed");
		game.setHTML("landed", "Du bist auf " + s.name + " gelandet.");
	}
	
	s.landcount++;
	game.addAlert(p.name + " ist auf " + s.name + " gelandet.");

	// Allow player to buy the property on which he landed.
	if (s.price !== 0 && s.owner === 0) {
		if (!p.human) {
			if (p.AI.buyProperty(p.position)) {
				tf.buy(game);
			}
		} else {
			game.setHTML("landed", "<div>Du bist auf <a href='javascript:void(0);' onmouseover='showdeed(" + p.position + ");' onmouseout='hidedeed();' class='statscellcolor'>" + s.name + "</a> gelandet.<input type='button' onclick='buy();' value='Kaufe (" + s.price + ")' title='Kaufe " + s.name + " für " + s.houseprice + ".'/></div>");
		}
	}

	// Collect rent
	if (s.owner !== 0 && s.owner != game.turn) {
		var rent = 0;

		if (s.house === 1) {
			rent = s.rent;
		}
		
		game.addAlert(p.name + " hat " + rent + " Miete an " + game.player[s.owner].name + " gezahlt.");
		p.pay(rent, s.owner);
		game.player[s.owner].money += rent;

    	if (p.human) game.setHTML("landed", "Du bist auf " + s.name + " gelandet. " + game.player[s.owner].name + " hat " + rent + " Miete kassiert.");
	}

	game.updateMoney();

	chanceCommunityChest(game);
}

function chanceCommunityChest(game) {
	var p = game.player[game.turn];

	if (game.phase == 1) {
		// Chance
		if (p.position === 3 || p.position === 9) {
			var chanceIndex = chanceCards.deck[game.chanceIndex];

			game.popupAll("<i class=\"fa-solid fa-question\" style='font-size: xx-large; height: 1em; width: 1em; float: left; margin: 8px 8px 8px 0px;' ></i><div style='font-weight: bold; font-size: 16px; '>" + chanceCards[chanceIndex].title + "</div><div style='text-align: justify;'>" + chanceCards[chanceIndex].text + "</div>"); //TODO

			chanceAction(game, chanceIndex);

			game.chanceIndex++;

			if (game.chanceIndex >= chanceCards.deck.length) {
				game.chanceIndex = 0;
			}
		} else if (!p.human) {
			if (!p.AI.onLand()) {
				game.next();
			}
		}
	} else {
		// Chance
		if (p.position === 3 || p.position === 9) {
			if (game.chanceIndex >= chanceCards2.deck.length) {
				game.chanceIndex = 0;
			}

			var chanceIndex = chanceCards2.deck[game.chanceIndex];

			game.popupAll("<i class=\"fa-solid fa-question\" style='font-size: xx-large; height: 1em; width: 1em; float: left; margin: 8px 8px 8px 0px;' ></i><div style='font-weight: bold; font-size: 16px; '>" + chanceCards2[chanceIndex].title + "</div><div style='text-align: justify;'>" + chanceCards2[chanceIndex].text + "</div>");

			chanceAction(game, chanceIndex);

			game.chanceIndex++;

			if (game.chanceIndex >= chanceCards2.deck.length) {
				game.chanceIndex = 0;
			}
		} else if (!p.human) {
			if (!p.AI.onLand()) {
				game.next();
			}
		}
	}
}

global.roll = function roll(game) {
	var p = game.player[game.turn];

	if (p == undefined) return;

	if (p.human) {
		game.sendRoll();
		game.changeButton("nextbutton", "Spielzug beenden", "Spielzug beenden und zum/zur nächsten SpielerIn wechseln.");
	}
  
	game.rollDice();
	game.updateDice();
	setTimeout(() => { move(game);}, 1000);

}

function move(game) {
	var p = game.player[game.turn];
	var die1 = game.getDie();

	game.addAlert(p.name + " hat " + die1 + " gewürfelt.");

	if (p.human) game.changeButton("nextbutton", "Spielzug beenden", "Spielzug beenden und zum/zur nächsten SpielerIn wechseln.");


	p_old = p.position;
	// Move player
	p.position += die1;

	// Pay interest as you pass GO
	if (p_old < 6 && p.position >= 6) {
		citytax(game);
	}
	if (p.position >= 12) {
		p.position -= 12;
		var kreditZinsen = Math.floor(p.sumKredit * game.zinssatz / 100);
		game.meineBank.zinsenLotto += kreditZinsen
		p.pay(kreditZinsen, 0);
		if (p.money < 0) {
			var dispoZinsen = Math.floor(-p.money * game.dispoZinssatz / 100);
			game.meineBank.zinsenLotto += dispoZinsen
			p.pay(dispoZinsen, 0);
		}
		
		game.addAlert(p.name + " ist über Start gezogen und hat Zinsen auf Kredite gezahlt.");
	}

	game.updatePosition(p_old)
	setTimeout(() => {land(game);}, 2000);
}

global.play = function play(game) {  

	if (game.player[game.turn].human && game.player[game.turn].money < 0) {
		game.popup("<p>Du hast dein Konto um " + (-game.player[game.turn].money) + " überzogen. Nimm einen Kredit auf, um Dispo-Zinsen zu vermeiden.</p>")
	}

	game.percent = 0;
	game.discount = 0;
	game.turn++;
	if (game.turn > game.pcount) {
		game.turn -= game.pcount;
	}

	if (game.socketUndefined() && game.player[game.turn].AI == null) return;
	
	var p = game.player[game.turn];
	game.resetDice();
	if (p.human) {
		game.show("#nextbutton");
		game.setHTML("pname", p.name);
	}
	game.addAlert(p.name + " ist an der Reihe.");

	game.updateChart();

	// Check for bankruptcy.
	p.pay(0, p.creditor);

	if (p.human) {
		game.hide("#landed, #option, #manage, #audio");
		game.show("#board, #control, #moneybar, #buy");

		game.focusButton("nextbutton");
		game.changeButton("nextbutton", "Würfeln", "Würfeln und Figur entsprechend vorrücken.");

		game.hide("#die0");
	}


	for (var i in game.SOCKET_LIST) {
		game.hide(".money-bar-arrow", i);
		game.show("#p" + game.turn + "arrow", i);
	}

	if (!p.human) {
		if (!p.AI.beforeTurn()) {
			game.next();
		}
	}
}

function setup(isKapitalismus, playernumber, nieten) {
	game.pcount = parseInt(playernumber);

	Object.assign(game.SOCKET_LIST, SOCKET_LIST);
	SOCKET_LIST = {};

	for (var i in game.SOCKET_LIST) {
		socket2game[game.SOCKET_LIST[i].id] = game;
	}

	game.gameRunning = true;
	games.push(game);

	for (var i = 0; i < 12; i++) {
		game.square[i].reset();
	}

	var playerArray = new Array(game.pcount);
	var p;

	playerArray.randomize();
	game.turn = playerArray[0] - 1;

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

	for (var i = 1; i <= game.pcount; i++) {

		p = game.player[playerArray[i - 1]];
		
		// player is human
		if (playerArray[i - 1] < playerNo) {
			p.human = true;
			p.color = colors.shift();
			p.name = playerNames[playerArray[i - 1]] ? playerNames[playerArray[i - 1]] : 'SpielerIn ' + playerArray[i - 1];
		} else {	//player is AI
			p.human = false;
			p.AI = new AITest(p, game);
			p.color = colors.shift();
			p.name = aiNames.pop();
		}
		
		//Immobilienkarten verteilen

		if (!isKapitalismus) {
			var n = game.pcount <= 4 ? 2 : 1;
			for (var j = 0; j < n; j++) {
				var pos = properties.pop();
				var property = game.square[pos];

				property.owner = playerArray[i - 1];
				game.addAlert(p.name + " hat " + property.name + " erhalten.");

				//game.updateOwned();
			}
			p.update();
		}	

		
		//end:Immobilienkarten verteilen
	}
	playerNo = 1;
	playerNames = {};

	if (isKapitalismus) {
		while (properties.length != 0) {
			for (var i = 2; i <= game.pcount; i++) {
				p = game.player[playerArray[i - 1]];
				var pos = properties.pop();
				if (pos == -1) {
					continue;
				}
				
				var property = game.square[pos];
				property.owner = playerArray[i - 1];
				game.addAlert(p.name + " hat " + property.name + " erhalten.");
				p.update();
			}
		}
	}

	game.setup();
	play(game);
}

function loadWindow() {
  	game = new Game();

	for (var i = 0; i <= 6; i++) {
		game.player[i] = new Player(game, "", "");
		game.player[i].index = i;
	}

	AITest.count = 0;

	game.player[1].human = true;
	game.player[0].name = "Bank";

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
		SOCKET_LIST[i].emit('setupsquares', game.square);
	  }
}

const Card = require('./Card');
var chanceCards = Card.chanceCards;
var chanceCards2 = Card.chanceCards2;

function citytax(game) {
	game.addAlert(game.player[game.turn].name + " ist auf oder über das Feld Staat/Finanzamt gezogen und Steuern aufs Guthaben gezahlt.");
	//TODO: ask to buy Vermögensgegenstände
	var steuer = Math.floor(0.1 * game.player[game.turn].money);
	game.player[game.turn].pay(steuer, 0);
	game.meinStaat.steuer += steuer;

	if (game.player[game.turn].color == "gold") {
		for (var i = 0; i < game.pcount; i++) {
			game.player[i+1].money += Math.floor(game.player[i+1].anleihen * (game.zinssatz / 100));
			game.meinStaat.steuer -= Math.floor(game.player[i+1].anleihen * (game.zinssatz / 100));
		}
		game.meineBank.zinsenLotto += Math.floor(game.meineBank.anleihenBank * (game.zinssatz / 100));
		game.meinStaat.zinsenLotto -= Math.floor(game.meineBank.anleihenBank * (game.zinssatz / 100));

		game.addAlert(" Der Staat hat Zinsen auf alle Anleihen gezahlt.");
	}

	if (game.meinStaat.steuer < 0) {
		if (game.phase = 1) {
			game.phase = 2;
			game.popupAll("Phase 2 beginnt.")
		}
		game.meineBank.geldMenge -= game.meinStaat.steuer;
		game.meineBank.buyAnleihen(game.meinStaat.steuer);
		game.meinStaat.staatsSchuld += game.meinStaat.steuer;
		game.meinStaat.steuer = 0;
	}
}

var AITest = require('./AI.js');
const { kMaxLength } = require('node:buffer');const { generatePrimeSync } = require('node:crypto');
