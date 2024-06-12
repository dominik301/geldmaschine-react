var express = require('express');
var compression = require('compression');
//const { title } = require('node:process');
var app = express();
app.use(compression());

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
app.use('/sitemap.xml',express.static(__dirname + '/sitemap.xml'));

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

  socket.on('sozialhilfe', function() {
	let game = socket2game[socket.id];
	  game.sozialHilfe();
	});

  socket.on('buyhouse',function(checkedProperty){
	let game = socket2game[socket.id];
    Object.keys(game.SOCKET_LIST).forEach(function eachKey(key) {
		if(game.SOCKET_LIST[key] == socket && key != game.turn){
			socket.emit('popup', game.player[key]. name + ", du bist nicht an der Reihe!");
			return;
		}
		else if (game.SOCKET_LIST[key] == socket){
			game.buyHouse(checkedProperty);  
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
            game.popup("Du brauchst " + (s.price - game.player[s.owner].money) + " mehr um die Hypothek für " + s.name + " zurückzuzahlen.");

        } else {
            game.popup(game.player[s.owner].name + ", möchtest du wirklich die Hypothek für " + s.name + " für " + s.price + " zurückzahlen?", "Ja/Nein", true);
        }
    } else {
        game.popup(game.player[s.owner].name + ", mächstest du wirkliche eine Hypothek für " + s.name + " für " + s.price + " aufnehmen?", "Ja/Nein", true);
    } 
  });

  socket.on('doMortgage', function (checkedProperty){
	let game = socket2game[socket.id];
    var s = game.square[checkedProperty];

    if (s.mortgage) {
      game.unmortgage(checkedProperty);
    } else {
      game.mortgage(checkedProperty);        
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
    game.sellHouse(checkedProperty);        
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

  socket.on('sendOffer', function(tradeObj) {
	let game = socket2game[socket.id];
	game.tradeObj = new Trade(tradeObj);
	  game.handleOffer();
  });

  socket.on('acceptTrade', (tradeObj) => {
	let game = socket2game[socket.id];
	game.acceptTrade(tradeObj)
  })

  socket.on("newbid", function(highestbidder,highestbid) {
	let game = socket2game[socket.id];
	game.highestbidder = highestbidder;
	game.highestbid = highestbid;
	game.bid();
  });

  socket.on("auctionExit", function(currentbidder) {
	let game = socket2game[socket.id];
	game.player[currentbidder].bidding = false;
  });

  socket.on("auctionHouse", function(propertyIndex) {
	let game = socket2game[socket.id];
	game.addPropertyToAuctionQueue(propertyIndex)
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

  socket.on('buy', function() {
	let game = socket2game[socket.id];
	Object.keys(game.SOCKET_LIST).forEach(function eachKey(key) {
		if(game.SOCKET_LIST[key] == socket && key == game.turn){
			game.buy();
		}
	});
  });
	
});

//
var port = process.env.PORT || 4000;
//var port = process.argv[2] == undefined ? 4141 : process.argv[2];
server.listen(port) //, "0.0.0.0");

//Start: Old code monopoly.js

var Game = require('./Game');
var games = [];
var game;

var Player = require('./Player');
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
	game.play();
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
}

const Card = require('./Card');
var chanceCards = Card.chanceCards;
var chanceCards2 = Card.chanceCards2;

var AITest = require('./AI.js');
//const { kMaxLength } = require('node:buffer');const { generatePrimeSync } = require('node:crypto');
