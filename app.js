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
  }

  socket.on('setup',function(isKapitalismus, pnumber, nieten){
    setup(isKapitalismus, pnumber, nieten);         
  });

  socket.on('next',function(){
    game.next();        
  });

  socket.on('resign',function(){
    game.resign();        
  });

  socket.on('buyhouse',function(checkedProperty){
    buyHouse(checkedProperty);        
  });

  socket.on('mortgage',function(){

    var s = square[checkedProperty];

    if (s.mortgage) {
        if (player[s.owner].money < s.houseprice) {
            //popup("<p>You need $" + (s.price - player[s.owner].money) + " more to unmortgage " + s.name + ".</p>");

        } else {
            /*popup("<p>" + player[s.owner].name + ", are you sure you want to unmortgage " + s.name + " for $" + s.price + "?</p>", function() {
                unmortgage(checkedProperty);
            }, "Yes/No");*/
            unmortgage(checkedProperty);
        }
    } else {
        /*popup("<p>" + player[s.owner].name + ", are you sure you want to mortgage " + s.name + " for $" + s.price + "?</p>", function() {
            socket.emit('mortgage', checkedProperty);
        }, "Yes/No");*/
        mortgage(checkedProperty);        
    } 
  });

  socket.on('sellhouse',function(checkedProperty){
    sellHouse(checkedProperty);        
  });

  socket.on('kreditaufnehmen',function(data){
    game.kreditAufnehmen(parseInt(data));        
  });

  socket.on('kredittilgen',function(data){
    game.kreditTilgen(parseInt(data));        
  });

  socket.on('eliminate',function(){
    game.eliminatePlayer();        
  });

  socket.on('updateOption',function(){
    updateOption();        
  });

  socket.on('showstats', function() {
    showStats();
  });

  socket.on('windowload', loadWindow); 

  socket.on('setName', function(name) {
    Object.keys(SOCKET_LIST).forEach(function eachKey(key) {
      if(SOCKET_LIST[key] == socket){
        var thisPlayer = player[key];
        thisPlayer.name = name;
      }
    });
    console.log(player)
  });

  socket.on('showdeed', function(property) {
    showdeed(property);
  })

  socket.on('disconnect',function(){
              
    delete SOCKET_LIST[socket.id];
		
	});

  socket.on('buy', buy);
	
});

server.listen(4141);


//Start: Old code monopoly.js

function Game() {
	var die1;
	var areDiceRolled = false;

	var derivateGesamt=0;
	var derivatePrivat=0;
	var derivateBank=0;
	this.zinssatz = 10;

	this.rollDice = function() {
		die1 = Math.floor(Math.random() * 6) + 1;
		areDiceRolled = true;
	};

	this.resetDice = function() {
		areDiceRolled = false;
	};

	this.next = function() {
		if (areDiceRolled && doublecount === 0) {
			play();
		} else {
			roll();
		}
	};

	this.getDie = function() {
		return die1;
	};

	// Credit functions:

	/*var resetCredit = function(initiator) {

		currentInitiator = initiator;

		document.getElementById("credit-leftp-name").textContent = initiator.name;
		document.getElementById("credit-leftp-money").value = "0";

	};

	this.credit = function(creditObj) {
		$("#board").hide();
		$("#control").hide();
		$("#trade").hide();
		$("#credit").hide();
		$("#kreditaufnehmenbutton").show();
		$("#kredittilgenbutton").show();

		if (creditObj instanceof Credit) {
			writeCredit(tradeObj);
		} else {
			var initiator = player[turn];

			currentInitiator = initiator;

			resetCredit(initiator);
		}
	};

	var readCredit = function() {
		var initiator = currentInitiator;
		var money;

		money = parseInt(document.getElementById("credit-leftp-money").value, 10) || 0;

		var credit = new Credit(initiator, money);

		return credit;
	};

	var writeCredit = function(creditObj) {
		resetTrade(creditObj.getInitiator(), creditObj.getRecipient(), false);

		if (creditObj.getMoney() > 0) {
			document.getElementById("trade-leftp-money").value = creditObj.getMoney() + "";
		} else {
			document.getElementById("trade-rightp-money").value = (-creditObj.getMoney()) + "";
		}

	};*/

	this.kreditAufnehmen = function(amount) {
    var initiator = player[turn];
    initiator.update();
		/*var creditObj = readCredit();
		var money = creditObj.getMoney();
		var initiator = player[turn];

		initiator.update()
		if (initiator.sumKredit + money > initiator.verfuegbareHypothek) {
			document.getElementById("credit-leftp-money").value = initiator.name + " does not have $" + money + ".";
			document.getElementById("credit-leftp-money").style.color = "red"; //TODO
			return false;
		} 	

		if (initiator.human && !confirm(initiator.name + ", möchtest Du wirklich einen Kredit aufnehmen?")) {
			return false;
		}*/

		initiator.kreditAufnehmen(amount);
	}

	this.kreditTilgen = function(amount) {
    var initiator = player[turn];
		/*var creditObj = readCredit();
		var money = creditObj.getMoney();
		var initiator = player[turn];

		if (money > initiator.money) {
			document.getElementById("credit-leftp-money").value = initiator.name + " does not have $" + money + ".";
			document.getElementById("credit-leftp-money").style.color = "red"; //TODO
			return false;
		} 	

		if (initiator.human && !confirm(initiator.name + ", möchtest Du wirklich einen Kredit tilgen?")) {
			return false;
		}*/

		initiator.kreditTilgen(amount);		
	}

  /*

	// Trade functions:



	var currentInitiator;
	var currentRecipient;

	

	var resetTrade = function(initiator, recipient, allowRecipientToBeChanged) {
		var currentSquare;
		var currentTableRow;
		var currentTableCell;
		var currentTableCellCheckbox;
		var nameSelect;
		var currentOption;
		var allGroupUninproved;
		var currentName;

		var tableRowOnClick = function(e) {
			var checkboxElement = this.firstChild.firstChild;

			if (checkboxElement !== e.srcElement) {
				checkboxElement.checked = !checkboxElement.checked;
			}

			$("#proposetradebutton").show();
			$("#canceltradebutton").show();
			$("#accepttradebutton").hide();
			$("#rejecttradebutton").hide();
		};

		var initiatorProperty = document.getElementById("trade-leftp-property");
		var recipientProperty = document.getElementById("trade-rightp-property");

		currentInitiator = initiator;
		currentRecipient = recipient;

		// Empty elements.
		while (initiatorProperty.lastChild) {
			initiatorProperty.removeChild(initiatorProperty.lastChild);
		}

		while (recipientProperty.lastChild) {
			recipientProperty.removeChild(recipientProperty.lastChild);
		}

		var initiatorSideTable = document.createElement("table");
		var recipientSideTable = document.createElement("table");


		for (var i = 0; i < 12; i++) {
			currentSquare = square[i];

			// Offered properties.
			if (currentSquare.owner === initiator.index) {
				currentTableRow = initiatorSideTable.appendChild(document.createElement("tr"));
				currentTableRow.onclick = tableRowOnClick;

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellcheckbox";
				currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
				currentTableCellCheckbox.type = "checkbox";
				currentTableCellCheckbox.id = "tradeleftcheckbox" + i;
				currentTableCellCheckbox.title = "Check this box to include " + currentSquare.name + " in the trade.";

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellcolor";
				currentTableCell.style.backgroundColor = currentSquare.color;

				if (currentSquare.groupNumber == 1 || currentSquare.groupNumber == 2) {
					currentTableCell.style.borderColor = "grey";
				} else {
					currentTableCell.style.borderColor = currentSquare.color;
				}

				currentTableCell.propertyIndex = i;
				currentTableCell.onmouseover = function() {showdeed(this.propertyIndex);};
				currentTableCell.onmouseout = hidedeed;

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellname";
				if (currentSquare.mortgage) {
					currentTableCell.title = "Mortgaged";
					currentTableCell.style.color = "grey";
				}
				currentTableCell.textContent = currentSquare.name;

			// Requested properties.
			} else if (currentSquare.owner === recipient.index) {
				currentTableRow = recipientSideTable.appendChild(document.createElement("tr"));
				currentTableRow.onclick = tableRowOnClick;

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellcheckbox";
				currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
				currentTableCellCheckbox.type = "checkbox";
				currentTableCellCheckbox.id = "traderightcheckbox" + i;
				currentTableCellCheckbox.title = "Check this box to include " + currentSquare.name + " in the trade.";

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellcolor";
				currentTableCell.style.backgroundColor = currentSquare.color;

				if (currentSquare.groupNumber == 1 || currentSquare.groupNumber == 2) {
					currentTableCell.style.borderColor = "grey";
				} else {
					currentTableCell.style.borderColor = currentSquare.color;
				}

				currentTableCell.propertyIndex = i;
				currentTableCell.onmouseover = function() {showdeed(this.propertyIndex);};
				currentTableCell.onmouseout = hidedeed;

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellname";
				if (currentSquare.mortgage) {
					currentTableCell.title = "Mortgaged";
					currentTableCell.style.color = "grey";
				}
				currentTableCell.textContent = currentSquare.name;
			}
		}

		if (initiatorSideTable.lastChild) {
			initiatorProperty.appendChild(initiatorSideTable);
		} else {
			initiatorProperty.textContent = initiator.name + " has no properties to trade.";
		}

		if (recipientSideTable.lastChild) {
			recipientProperty.appendChild(recipientSideTable);
		} else {
			recipientProperty.textContent = recipient.name + " has no properties to trade.";
		}

		document.getElementById("trade-leftp-name").textContent = initiator.name;

		currentName = document.getElementById("trade-rightp-name");

		if (allowRecipientToBeChanged && pcount > 2) {
			// Empty element.
			while (currentName.lastChild) {
				currentName.removeChild(currentName.lastChild);
			}

			nameSelect = currentName.appendChild(document.createElement("select"));
			for (var i = 1; i <= pcount; i++) {
				if (i === initiator.index) {
					continue;
				}

				currentOption = nameSelect.appendChild(document.createElement("option"));
				currentOption.value = i + "";
				currentOption.style.color = player[i].color;
				currentOption.textContent = player[i].name;

				if (i === recipient.index) {
					currentOption.selected = "selected";
				}
			}

			nameSelect.onchange = function() {
				resetTrade(currentInitiator, player[parseInt(this.value, 10)], true);
			};

			nameSelect.title = "Select a player to trade with.";
		} else {
			currentName.textContent = recipient.name;
		}

		document.getElementById("trade-leftp-money").value = "0";
		document.getElementById("trade-rightp-money").value = "0";

	};

	var readTrade = function() {
		var initiator = currentInitiator;
		var recipient = currentRecipient;
		var property = new Array(40);
		var money;

		for (var i = 0; i < 12; i++) {

			if (document.getElementById("tradeleftcheckbox" + i) && document.getElementById("tradeleftcheckbox" + i).checked) {
				property[i] = 1;
			} else if (document.getElementById("traderightcheckbox" + i) && document.getElementById("traderightcheckbox" + i).checked) {
				property[i] = -1;
			} else {
				property[i] = 0;
			}
		}

		money = parseInt(document.getElementById("trade-leftp-money").value, 10) || 0;
		money -= parseInt(document.getElementById("trade-rightp-money").value, 10) || 0;

		var trade = new Trade(initiator, recipient, money, property);

		return trade;
	};

	var writeTrade = function(tradeObj) {
		resetTrade(tradeObj.getInitiator(), tradeObj.getRecipient(), false);

		for (var i = 0; i < 12; i++) {

			if (document.getElementById("tradeleftcheckbox" + i)) {
				document.getElementById("tradeleftcheckbox" + i).checked = false;
				if (tradeObj.getProperty(i) === 1) {
					document.getElementById("tradeleftcheckbox" + i).checked = true;
				}
			}

			if (document.getElementById("traderightcheckbox" + i)) {
				document.getElementById("traderightcheckbox" + i).checked = false;
				if (tradeObj.getProperty(i) === -1) {
					document.getElementById("traderightcheckbox" + i).checked = true;
				}
			}
		}

		if (tradeObj.getMoney() > 0) {
			document.getElementById("trade-leftp-money").value = tradeObj.getMoney() + "";
		} else {
			document.getElementById("trade-rightp-money").value = (-tradeObj.getMoney()) + "";
		}

	};

	this.trade = function(tradeObj) {
		$("#board").hide();
		$("#control").hide();
		$("#trade").show();
		$("#credit").show();
		$("#proposetradebutton").show();
		$("#canceltradebutton").show();
		$("#accepttradebutton").hide();
		$("#rejecttradebutton").hide();

		if (tradeObj instanceof Trade) {
			writeTrade(tradeObj);
			this.proposeTrade();
		} else {
			var initiator = player[turn];
			var recipient = turn === 1 ? player[2] : player[1];

			currentInitiator = initiator;
			currentRecipient = recipient;

			resetTrade(initiator, recipient, true);
		}
	};


	this.cancelTrade = function() {
		$("#board").show();
		$("#control").show();
		$("#trade").hide();
		$("#credit").hide();


		if (!player[turn].human) {
			player[turn].AI.alertList = "";
			game.next();
		}

	};

	this.acceptTrade = function(tradeObj) {
		if (isNaN(document.getElementById("trade-leftp-money").value)) {
			document.getElementById("trade-leftp-money").value = "This value must be a number.";
			document.getElementById("trade-leftp-money").style.color = "red";
			return false;
		}

		if (isNaN(document.getElementById("trade-rightp-money").value)) {
			document.getElementById("trade-rightp-money").value = "This value must be a number.";
			document.getElementById("trade-rightp-money").style.color = "red";
			return false;
		}

		var showAlerts = true;
		var money;
		var initiator;
		var recipient;

		if (tradeObj) {
			showAlerts = false;
		} else {
			tradeObj = readTrade();
		}

		money = tradeObj.getMoney();
		initiator = tradeObj.getInitiator();
		recipient = tradeObj.getRecipient();


		if (money > 0 && money > initiator.money) {
			document.getElementById("trade-leftp-money").value = initiator.name + " does not have $" + money + ".";
			document.getElementById("trade-leftp-money").style.color = "red";
			return false;
		} else if (money < 0 && -money > recipient.money) {
			document.getElementById("trade-rightp-money").value = recipient.name + " does not have $" + (-money) + ".";
			document.getElementById("trade-rightp-money").style.color = "red";
			return false;
		}

		var isAPropertySelected = 0;

		// Ensure that some properties are selected.
		for (var i = 0; i < 12; i++) {
			isAPropertySelected |= tradeObj.getProperty(i);
		}

		if (isAPropertySelected === 0) {
			popup("<p>One or more properties must be selected in order to trade.</p>");

			return false;
		}

		if (showAlerts && !confirm(initiator.name + ", are you sure you want to make this exchange with " + recipient.name + "?")) {
			return false;
		}

		// Exchange properties
		for (var i = 0; i < 12; i++) {

			if (tradeObj.getProperty(i) === 1) {
				square[i].owner = recipient.index;
				addAlert(recipient.name + " received " + square[i].name + " from " + initiator.name + ".");
			} else if (tradeObj.getProperty(i) === -1) {
				square[i].owner = initiator.index;
				addAlert(initiator.name + " received " + square[i].name + " from " + recipient.name + ".");
			}

		}

		// Exchange money.
		if (money > 0) {
			initiator.pay(money, recipient.index);
			recipient.money += money;

			addAlert(recipient.name + " received $" + money + " from " + initiator.name + ".");
		} else if (money < 0) {
			money = -money;

			recipient.pay(money, initiator.index);
			initiator.money += money;

			addAlert(initiator.name + " received $" + money + " from " + recipient.name + ".");
		}

		updateOwned();
		updateMoney();

		$("#board").show();
		$("#control").show();
		$("#trade").hide();
		$("#credit").hide();

		if (!player[turn].human) {
			player[turn].AI.alertList = "";
			game.next();
		}
	};

	this.proposeTrade = function() {
		if (isNaN(document.getElementById("trade-leftp-money").value)) {
			document.getElementById("trade-leftp-money").value = "This value must be a number.";
			document.getElementById("trade-leftp-money").style.color = "red";
			return false;
		}

		if (isNaN(document.getElementById("trade-rightp-money").value)) {
			document.getElementById("trade-rightp-money").value = "This value must be a number.";
			document.getElementById("trade-rightp-money").style.color = "red";
			return false;
		}

		var tradeObj = readTrade();
		var money = tradeObj.getMoney();
		var initiator = tradeObj.getInitiator();
		var recipient = tradeObj.getRecipient();
		var reversedTradeProperty = [];

		if (money > 0 && money > initiator.money) {
			document.getElementById("trade-leftp-money").value = initiator.name + " does not have $" + money + ".";
			document.getElementById("trade-leftp-money").style.color = "red";
			return false;
		} else if (money < 0 && -money > recipient.money) {
			document.getElementById("trade-rightp-money").value = recipient.name + " does not have $" + (-money) + ".";
			document.getElementById("trade-rightp-money").style.color = "red";
			return false;
		}

		var isAPropertySelected = 0;

		// Ensure that some properties are selected.
		for (var i = 0; i < 12; i++) {
			reversedTradeProperty[i] = -tradeObj.getProperty(i);
			isAPropertySelected |= tradeObj.getProperty(i);
		}

		if (isAPropertySelected === 0) {
			popup("<p>One or more properties must be selected in order to trade.</p>");

			return false;
		}

		if (initiator.human && !confirm(initiator.name + ", are you sure you want to make this offer to " + recipient.name + "?")) {
			return false;
		}

		var reversedTrade = new Trade(recipient, initiator, -money, reversedTradeProperty);

		if (recipient.human) {

			writeTrade(reversedTrade);

			$("#proposetradebutton").hide();
			$("#canceltradebutton").hide();
			$("#accepttradebutton").show();
			$("#rejecttradebutton").show();

			addAlert(initiator.name + " initiated a trade with " + recipient.name + ".");
			popup("<p>" + initiator.name + " has proposed a trade with you, " + recipient.name + ". You may accept, reject, or modify the offer.</p>");
		} else {
			var tradeResponse = recipient.AI.acceptTrade(tradeObj);

			if (tradeResponse === true) {
				popup("<p>" + recipient.name + " has accepted your offer.</p>");
				this.acceptTrade(reversedTrade);
			} else if (tradeResponse === false) {
				popup("<p>" + recipient.name + " has declined your offer.</p>");
				return;
			} else if (tradeResponse instanceof Trade) {
				popup("<p>" + recipient.name + " has proposed a counteroffer.</p>");
				writeTrade(tradeResponse);

				$("#proposetradebutton, #canceltradebutton").hide();
				$("#accepttradebutton").show();
				$("#rejecttradebutton").show();
			}
		}
	};

  */ //TODO: addTrade

	// Bankrupcy functions:


	this.eliminatePlayer = function() {
		var p = player[turn];

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
		turn--;

		/*if (pcount === 2) {
			document.getElementById("stats").style.width = "454px";
		} else if (pcount === 3) {
			document.getElementById("stats").style.width = "686px";
		}*/ //TODO

		if (pcount === 1) {
			updateMoney();
			/*$("#control").hide();
			$("#board").hide();
			$("#refresh").show();

			popup("<p>Congratulations, " + player[1].name + ", you have won the game.</p><div>");*/ //TODO: winner

		} else {
			play();
		}
	};

	this.bankruptcyUnmortgage = function() {
		var p = player[turn];

		if (p.creditor === 0) {
			game.eliminatePlayer();
			return;
		}

		var HTML = "<p>" + player[p.creditor].name + ", you may unmortgage any of the following properties, interest free, by clicking on them. Click OK when finished.</p><table>";
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
				HTML += "' onmouseover='showdeed(" + i + ");' onmouseout='hidedeed();'></td><td class='propertycellname'><a href='javascript:void(0);' title='Unmortgage " + sq.name + " for $" + price + ".' onclick='if (" + price + " <= player[" + p.creditor + "].money) {player[" + p.creditor + "].pay(" + price + ", 0); square[" + i + "].mortgage = false; addAlert(\"" + player[p.creditor].name + " unmortgaged " + sq.name + " for $" + price + ".\");} this.parentElement.parentElement.style.display = \"none\";'>Unmortgage " + sq.name + " ($" + price + ")</a></td></tr>";

				sq.owner = p.creditor;

			}
		}

		HTML += "</table>";

    SOCKET_LIST[turn].emit('eliminatePlayer', HTML);

		//popup(HTML, game.eliminatePlayer);
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

		addAlert(p.name + " is bankrupt.");

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
					bankruptcyUnmortgageFee += Math.round(sq.price * 0.1);
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

		/*if (pcount === 2 || bankruptcyUnmortgageFee === 0 || p.creditor === 0) {
			game.eliminatePlayer();
		} else {
			addAlert(pcredit.name + " paid $" + bankruptcyUnmortgageFee + " interest on the mortgaged properties received from " + p.name + ".");
			popup("<p>" + pcredit.name + ", you must pay $" + bankruptcyUnmortgageFee + " interest on the mortgaged properties you received from " + p.name + ".</p>", function() {player[pcredit.index].pay(bankruptcyUnmortgageFee, 0); game.bankruptcyUnmortgage();});
		}*/ //TODO: elimination
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

			updateMoney();

			return true;
		} else {
			this.money -= amount;
			this.creditor = creditor;

			updateMoney();

			return false;
		}
	};

	this.buyDerivate = function (amount) {
		this.derivate += amount;
		this.money -= amount;
		this.update();
	};

	this.buyAnleihen = function (amount) {
		this.anleihen += amount;
		this.money -= amount;
		this.update();
	};

	this.update = function() {
		var sq;
		this.gesamtHypothek = 0;

		for (var i = 0; i < 12; i++) {
			sq = square[i];
			if (player[sq.owner] == this) {
				this.gesamtHypothek += sq.price * (1 + sq.house)
			}
		}

		this.verfuegbareHypothek = this.gesamtHypothek + this.anleihen + this.derivate;
	};

	this.kreditAufnehmen = function (amount) {
    console.log("Kreditaufnahme", this.sumKredit, amount, this.verfuegbareHypothek);
    console.log(this.sumKredit + amount < this.verfuegbareHypothek);
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

function Bank(name="bank", color="black") {
	this.name = name;
	this.color = color;
	this.position = 0;
	this.creditor = -1;
	this.bidding = true;
	this.human = true;
	this.geldMenge = 0;
	this.zinsenLotto = 0;
	this.derivateBank;
	this.anleihenBank;

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

	this.buyDerivate = function (amount) {
		this.derivateBank += amount;
		//this.zinsenLotto -= amount;
		this.update()
	};

	this.buyAnleihen = function (amount) {
		this.anleihenBank += amount;
		//this.zinsenLotto -= amount;
		this.update()
	};

	this.update = function() {
		this.verfuegbareHypothek = this.gesamtHypothek + this.anleihen + this.derivate;
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
//TODO: anleihen, derivate

function Trade(initiator, recipient, money, property) {
	// For each property and anleihen or derivate, 1 means offered, -1 means requested, 0 means neither.

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
var turn = 0, doublecount = 0;
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
	// Reset borders
	/*for (var i = 0; i < 12; i++) {
		document.getElementById("cell" + i).style.border = "1px solid black";
		document.getElementById("cell" + i + "positionholder").innerHTML = "";

	}*/

	var sq, left, top;

	/*for (var x = 0; x < 12; x++) {
		sq = square[x];
		left = 0;
		top = 0;

		for (var y = turn; y <= pcount; y++) {

			if (player[y].position == x) {

				document.getElementById("cell" + x + "positionholder").innerHTML += "<div class='cell-position' title='" + player[y].name + "' style='background-color: " + player[y].color + "; left: " + left + "px; top: " + top + "px;'></div>";
				if (left == 36) {
					left = 0;
					top = 12;
				} else
					left += 12;
			}
		}

		for (var y = 1; y < turn; y++) {

			if (player[y].position == x) {
				document.getElementById("cell" + x + "positionholder").innerHTML += "<div class='cell-position' title='" + player[y].name + "' style='background-color: " + player[y].color + "; left: " + left + "px; top: " + top + "px;'></div>";
				if (left == 36) {
					left = 0;
					top = 12;
				} else
					left += 12;
			}
		}
	}*/ //TODO: add marker

	left = 0;
	top = 53;

	p = player[turn];

	//document.getElementById("cell" + p.position).style.border = "1px solid " + p.color;	
}

function updateMoney() {
  for(var i in SOCKET_LIST){
    SOCKET_LIST[i].emit('updateMoney', player, turn, meineBank, meinStaat);
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
  SOCKET_LIST[turn].emit('updateOption', square);
}

function chanceAction(chanceIndex) {
	var p = player[turn]; // This is needed for reference in action() method.

	chanceCards[chanceIndex].action(p);

	updateMoney();
}

function addamount(amount, cause) {
	var p = player[turn];

	p.money += amount;

	addAlert(p.name + " received $" + amount + " from " + cause + ".");
}

function subtractamount(amount, cause) {
	var p = player[turn];

	p.pay(amount, 0);

	addAlert(p.name + " lost $" + amount + " from " + cause + ".");
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

	addAlert(p.name + " lost $" + total + " from " + cause + ".");
}

function advance(destination, pass) {
	var p = player[turn];
	//TODO
	if (typeof pass === "number") {
		if (p.position < pass) {
			p.position = pass;
		} else {
			p.position = pass;
			p.money -= p.sumKredit * game.zinssatz / 100;
			meineBank.zinsenLotto += p.sumKredit * game.zinssatz / 100;
			addAlert(p.name + " collected a $200 salary for passing GO.");
		}
	}
	if (p.position < destination) {
		p.position = destination;
	} else {
		p.position = destination;
		p.money -= p.sumKredit * game.zinssatz / 100;
		meineBank.zinsenLotto += p.sumKredit * game.zinssatz / 100;
		addAlert(p.name + " collected a $200 salary for passing GO.");
	}

	land();
}

function payplayer(position, amount) {
	var receiver = turn + position;
	var nPlayer = pcount
	
	if (receiver < 0) {
		receiver = nPlayer - 1;
	}
	if (receiver == nPlayer) {
		receiver = 0;
	}

	var p = player[turn];

	player[receiver].money += amount;

	p.pay(amount, receiver);

	addAlert(p.name + " lost $" + amount + ".");

}

function payState(amount) {
	var p = player[turn];

	meinStaat.steuer += amount;

	if (meinStaat.steuer < 0) {
		meineBank.geldMenge -= meinStaat.steuer;
		meineBank.buyAnleihen(meinStaat.steuer);
		meinStaat.staatsSchuld += meinStaat.steuer;
		meinStaat.steuer = 0;
	}

	p.pay(amount, 0);

	addAlert(p.name + " lost $" + amount + ".");
}

function receiveBankguthaben() {
	p.money += meineBank.zinsenLotto;
	meineBank.zinsenLotto = 0;
}

function buyHouse(index) {

	var sq = square[index];
	var p = player[sq.owner];

  var houseSum = 0;

  if (p.money < sq.houseprice) {
    //popup("<p>You need $" + (sq.houseprice - player[sq.owner].money) + " more to buy a house for " + sq.name + ".</p>"); //TODO
    return false;
  }

  for (var i = 0; i < 12; i++) {
      houseSum += square[i].house;
  }

  if (sq.house < 2 && houseSum >= 11) {
      //popup("<p>All 11 houses are owned. You must wait until one becomes available.</p>"); //TODO
      return false;
  } 

  if (sq.house < 1) {
    sq.house++;
    addAlert(p.name + " placed a house on " + sq.name + ".");
  } else {
    return;
  }

  payeachplayer(sq.houseprice, "buying a house"); //p.pay?

  updateOwned();
  updateMoney();
	
}

function sellHouse(index) {
	sq = square[index];
	p = player[sq.owner];

	sq.house--;
	addAlert(p.name + " sold a house on " + sq.name + ".");

	p.money += sq.houseprice;
	updateOwned();
	updateMoney();
}

function showStats() {
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
					mortgagetext = "title='Mortgaged' style='color: grey;'";
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
			HTML += p.name + " dosen't have any properties.";
		} else {
			HTML += "</table>";
		}

		HTML += "</td>";
	}
	HTML += "</tr></table><div id='titledeed'></div>";

  SOCKET_LIST[turn].emit('showstats', HTML);
}

function showdeed(property) {

	var sq = square[property];
  SOCKET_LIST[turn].emit('showdeed', sq);
}

function buy() {
	var p = player[turn];
	var property = square[p.position];
	var cost = property.price;

	if (p.money >= cost) {
		p.pay(cost, 0);

		property.owner = turn;
		updateMoney();
		addAlert(p.name + " bought " + property.name + " for " + property.pricetext + ".");

		updateOwned();

    SOCKET_LIST[turn].emit('show', "#landed", false);

	} else {
		//popup("<p>" + p.name + ", you need $" + (property.price - p.money) + " more to buy " + property.name + ".</p>"); //TODO
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

  value = "Unmortgage for $" + mortgagePrice;
  title = "Unmortgage " + sq.name + " for $" + mortgagePrice + ".";

  SOCKET_LIST[turn].emit('changeButton', "mortgagebutton", value, title);

	addAlert(p.name + " mortgaged " + sq.name + " for $" + mortgagePrice + ".");
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

  value = "Mortgage for $" + mortgagePrice;
  title = "Mortgage " + sq.name + " for $" + mortgagePrice + ".";

  SOCKET_LIST[turn].emit('changeButton', "mortgagebutton", value, title);

	addAlert(p.name + " unmortgaged " + sq.name + " for $" + unmortgagePrice + ".");
	updateOwned();
	return true;
}

function land(increasedRent) {

	var p = player[turn];
	var s = square[p.position];

  SOCKET_LIST[turn].emit('show', "#landed", true);
  SOCKET_LIST[turn].emit('setHTML', "landed", "You landed on " + s.name + ".");

	s.landcount++;
	addAlert(p.name + " landed on " + s.name + ".");

	// Allow player to buy the property on which he landed.
	if (s.price !== 0 && s.owner === 0) {

		{
      SOCKET_LIST[turn].emit('setHTML', "landed", "<div>You landed on <a href='javascript:void(0);' onmouseover='showdeed(" + p.position + ");' onmouseout='hidedeed();' class='statscellcolor'>" + s.name + "</a>.<input type='button' onclick='buy();' value='Buy ($" + s.price + ")' title='Buy " + s.name + " for " + s.pricetext + ".'/></div>");
		}
	}

	// Collect rent
	if (s.owner !== 0 && s.owner != turn) {
		var rent = 0;

		if (s.house === 1) {
			rent = s.rent;
		}
		
		addAlert(p.name + " paid $" + rent + " rent to " + player[s.owner].name + ".");
		p.pay(rent, s.owner);
		player[s.owner].money += rent;

    SOCKET_LIST[turn].emit('setHTML', "landed", "You landed on " + s.name + ". " + player[s.owner].name + " collected $" + rent + " rent.");
	}

	updateMoney();
	updatePosition();
	updateOwned();

	chanceCommunityChest()
}

function chanceCommunityChest() {
	var p = player[turn];

	// Chance
	if (p.position === 3 || p.position === 9) {
		var chanceIndex = chanceCards.deck[chanceCards.index];

		/*popup("<img src='images/chance_icon.png' style='height: 50px; width: 26px; float: left; margin: 8px 8px 8px 0px;' /><div style='font-weight: bold; font-size: 16px; '>Chance:</div><div style='text-align: justify;'>" + chanceCards[chanceIndex].text + "</div>", function() {
			
		}); */ //TODO

    chanceAction(chanceIndex);

		chanceCards.index++;

		if (chanceCards.index >= chanceCards.deck.length) {
			chanceCards.index = 0;
		}
	}
}

function roll() {
	var p = player[turn];

  SOCKET_LIST[turn].emit('roll');
  SOCKET_LIST[turn].emit('changeButton', "nextbutton", "End turn", "End turn and advance to the next player.");

	game.rollDice();
	var die1 = game.getDie();

	doublecount++;

	addAlert(p.name + " rolled " + die1 + ".");

	SOCKET_LIST[turn].emit('changeButton', "nextbutton", "End turn", "End turn and advance to the next player.");
	doublecount = 0;

	updatePosition();
	updateMoney();
	updateOwned();

	
	updateDice(die1);

	p_old = p.position;
	// Move player
	p.position += die1;

	//TODO
	// Pay taxes as you pass GO
	if (p_old < 6 && p.position >= 6) {
		citytax();
	}
	if (p.position >= 12) {
		p.position -= 12;
		meineBank.zinsenLotto += p.sumKredit * game.zinssatz / 100;
		p.money -= p.sumKredit * game.zinssatz / 100;
		addAlert(p.name + " payed taxes for passing GO.");
	}

	land();
}

function play() {  

	turn++;
	if (turn > pcount) {
		turn -= pcount;
	}

  SOCKET_LIST[turn].emit('show', "#nextbutton", true);
  console.log(turn, "should see the button now")

	var p = player[turn];
	game.resetDice();
  SOCKET_LIST[turn].emit('setHTML', "pname", p.name);

	addAlert("It is " + p.name + "'s turn.");

	// Check for bankruptcy.
	p.pay(0, p.creditor);

  SOCKET_LIST[turn].emit('show', "#landed, #option, #manage", false);
  SOCKET_LIST[turn].emit('show', "#board, #control, #moneybar, #viewstats, #buy", true);

	doublecount = 0;
  SOCKET_LIST[turn].emit('focusbutton', "nextbutton");
  SOCKET_LIST[turn].emit('changeButton', "nextbutton", "Roll Dice", "Roll the dice and move your token accordingly.");

  SOCKET_LIST[turn].emit('show', "#die0", false);

	updateMoney();
	updatePosition();
	updateOwned();

  SOCKET_LIST[turn].emit('show', ".money-bar-arrow", false);
  SOCKET_LIST[turn].emit('show', "#p" + turn + "arrow", true);

}

function setup(isKapitalismus, playernumber, nieten) {
	pcount = playernumber;

	var playerArray = new Array(pcount);
	var p;

	playerArray.randomize();

	var colors = ["yellow", "red", "beige", "purple", "orange", "violet"]

	var properties = new Array(1,2,4,5,7,8,10,11);
	
	if (isKapitalismus) {
		for (i = 0; i < nieten; i++) {
			properties.push(-1);
		}
	}

	properties.sort(function() { return 0.5 - Math.random();});

	for (var i = 1; i <= pcount; i++) {
		p = player[i];
		p.color = colors.shift();

    console.log(player, playerArray)

		p = player[playerArray[i - 1]];
		
		//p.name = document.getElementById("player" + i + "name").value; //TODO
		p.human = true;
		console.log(p);
		
		//Immobilienkarten verteilen

		if (!isKapitalismus) {
			var n = pcount <= 4 ? 2 : 1;
			for (var j = 0; j < n; j++) {
				var pos = properties.pop();
				var property = square[pos];

				property.owner = playerArray[i - 1];
				addAlert(p.name + " received " + property.name + ".");

				//updateOwned();
			}
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
				addAlert(p.name + " received " + property.name + ".");
			}
		}
	}

  for(var i in SOCKET_LIST){
    SOCKET_LIST[i].emit('show', "#control, #board, #moneybar", true);
    SOCKET_LIST[i].emit('show', "#setup", false);
  }

  
	
	/*if (pcount === 3) {
		document.getElementById("stats").style.width = "686px";
	}

	document.getElementById("stats").style.top = "0px";
	document.getElementById("stats").style.left = "0px";*/

	play();
}

/*function menuitem_onmouseover(element) {
	element.className = "menuitem menuitem_hover";
	return;
}

function menuitem_onmouseout(element) {
	element.className = "menuitem";
	return;
}*/

function loadWindow() {
  game = new Game();

	for (var i = 0; i <= 6; i++) {
		player[i] = new Player("", "");
		player[i].index = i;
	}

	player[1].human = true;
	player[0].name = "the bank";

	chanceCards.index = 0;

	chanceCards.deck = [];

	for (var i = 0; i < 15; i++) {
		chanceCards.deck[i] = i;
	}

	// Shuffle Chance and Community Chest decks.
	chanceCards.deck.sort(function() {return Math.random() - 0.5;});

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
}

function Card(text, action) {
	this.text = text;
	this.action = action;
}

function corrections() {
}

function citytax() {
	addAlert(player[turn].name + " landed on Staat/Finanzamt.");
	//TODO: ask to buy Vermögensgegenstände
	var steuer = 0.1 * player[turn].money;
	player[turn].pay(steuer, 0);
	meinStaat.steuer += steuer;

	if (player[turn].color == "yellow") {
		for (var i = 0; i < pcount; i++) {
			player[i+1].money += player[i+1].anleihen * (game.zinssatz / 100);
		}
	}

	//$("#landed").show().text("You landed on Staat/Finanzamt. Zahle 10% von Deinem Guthaben."); //TODO
}

var square = [];

square[0] = new Square("Start/Bank", "Wer auf oder über dieses Feld zieht, zahlt Zinsen für alle offenen Kredite.", "yellow");
square[1] = new Square("Kiesweg 1", "12.000", "yellow", 12000, 36000);
square[2] = new Square("Kiesweg 2", "14.000", "yellow", 14000, 42000);
square[3] = new Square("Ereignisfeld", "", "green");
square[4] = new Square("Alleenring 1", "22.000", "green", 22000, 66000);
square[5] = new Square("Alleenring 2", "24.000", "green", 24000, 72000);
square[6] = new Square("Staat/Finanzamt", "Wer auf oder über dieses Feld zieht, zahlt 10% Steuern aufs aktuelle Guthaben. Zieht Gelb auf oder über dieses Feld zahlt der Staat Zinsen auf alle Anleihen.", "yellow");
square[7] = new Square("Ziegelstraße 1", "16.000", "red", 16000, 48000);
square[8] = new Square("Ziegelstraße 2", "16.000", "red", 16000, 48000);
square[9] = new Square("Ereignisfeld", "", "green");
square[10] = new Square("Nasse Gasse 1", "18.000", "blue", 18000, 54000);
square[11] = new Square("Nasse Gasse 2", "18.000", "blue", 18000, 54000);

var chanceCards = [];

chanceCards[0] = new Card("TÜV\nDein Auto muss zum TÜV. Zahle 5.000 an die Werkstatt: Linke/r Mitspieler*in.", function() { payplayer(1, 5000);});
chanceCards[1] = new Card("Konsum\nDu kaufst ein Motorrad. Überweise 8.000 an die Person rechts neben Dir.", function() { payplayer(-1, 8000);});
chanceCards[2] = new Card("Urlaub\nMache Urlaub im Umland. Überweise 6.000 anteilig an alle, da sie für Dich kochen, putzen, singen...", function() { payeachplayer(6000,"Ereignisfeld");});
chanceCards[3] = new Card("Lobbyarbeit\nDer Besuch des Opernballs kostet Dich 3.000. Überweise an den Staat.", function() { payState(3000);});
chanceCards[4] = new Card("Geburtstag\nDu hast einen runden Geburtstag. Die Party kostet 6.000. Überweise an alle Mitspieler*innen.", function() { payeachplayer(6000,"Ereignisfeld");});
chanceCards[5] = new Card("KFZ-Steuer\nZahle für Deinen Fahrzeugpark 4.000 Kfz-Steuer am den Staat.", function() { payState(4000);});
chanceCards[6] = new Card("Strafticket\nDu musst Deine Fahrerlaubnis erneuern. Überweise 3.000 an den Staat.", function() { payState(3000);});
chanceCards[7] = new Card("Hauptgewinn\nGlückwunsch! Du hast im Lotto gewonnen und erhältst das gesamte Bankguthaben als Gewinn.", function() { receiveBankguthaben();});
chanceCards[8] = new Card("Zuzahlung\nDu warst zur Kur und musst 2.000 zuzahlen. Überweise an den Staat.", function() { payState(2000);});
chanceCards[9] = new Card("Banküberfall\nDu hast die Bank überfallen und den Tresor geräumt. Die Bank überweist Dir ihr gesamtes Guthaben.", function() { receiveBankguthaben();});
chanceCards[10] = new Card("Finanzamt\nRücke direkt ins Finanzamt vor und zahle Steuern auf dein aktuelles Guthaben. Du kannst vorher andere Geschäfte tätigen.", function() { advance(6);}); //TODO
chanceCards[11] = new Card("Du verkaufst an die Person mit dem aktuell niedrigsten Saldo ein Auto. Lass Dir 4.000 überweisen. Kreditaufnahme für Kauf möglich.", function() { sellPoorest(4000);}); //TODO
chanceCards[12] = new Card("Spende\nSpende 10.000 für das Gemeinwohl. Überweise an den Staat.", function() { payState(10000);});
chanceCards[13] = new Card("GEMA\nDie GEMA fordert 1.000 für die Musikbeschallung in deiner Firma. Überweise an den Staat.", function() { payState(1000);});
chanceCards[14] = new Card("Steuererstattung\nDu bekommst 5.000 vom Finanzamt (Staat) erstattet.", function() { payState(-5000);});

var chanceCards2 = [];

chanceCards2[0] = new Card("Steuerforderung\nZahle 10.000 an den Staat.", function() { payState(10000);});
chanceCards2[1] = new Card("Konsum\nDu verkaufst der/dem Reichsten eine Yacht für 40.000.", function() { payplayer(-1, 8000);});
chanceCards2[2] = new Card("Wasserrohrbruch\nZahle für die Reparatur 8.000 an Deine*n rechte*n Mitspieler*in", function() { payRichest(8000);}); //TODO
chanceCards2[3] = new Card("Studiengebühren\nDeine Tochter macht ein Auslandssemester. Du unterstützt sie mit 15.000. Überweise an den Staat.", function() { payState(15000);});
chanceCards2[4] = new Card("Investitionsbeihilfe\nDer Staat übernimmt 10% deiner Baukosten, wenn du ein 2. Haus auf eins Deiner Grundstücke baust. Du darfst keine Miete dafür erhenem. Steuerbegünstigter Leerstand um Geld in Umlauf zu bringen! Du kannst Kredit aufnehmen.", function() { secondHouse(percent=0.1);}); //TODO
chanceCards2[5] = new Card("Feuerschaden\nNach Hausbrand zahlt die Versicherung (Staat) 48.000. Du renovierst und überweist das Geld anteilig an alle.", function() { payState(4000);});
chanceCards2[6] = new Card("Heizungsreparatur\nFür die Reparatur bekommst du 10.000 von der Person rechts neben Dir. Zum Bezahlen kann außerplanmäßig ein Kredit aufgenommen werden.", function() { payState(3000);});
chanceCards2[7] = new Card("Steuerfahndung\nDir wurde Steuerhinterziehung nachgewiesen. Überweise 50% Deines Guthabens an den Staat.", function(p) { steuerHinterziehung(p.money * 0.5);});
chanceCards2[8] = new Card("Fensterreparatur\nDu hast im Haus auf diesem Feld die Fenster repariert. Der/die Eigentümer*in zahlt Dir 15.000. Dafür ist Kreditaufnahme möglich.", function() { payState(2000);}); //?
chanceCards2[9] = new Card("Feinstaubplaketten\nKaufe Plaketten für deinen Fahrzeugpark. Zahle 1.000 an den Staat.", function() { receiveBankguthaben();});
chanceCards2[10] = new Card("Investitionsbeihilfe\nWenn Du jetzt baust, zahlt der Staat 20.000 dazu. Du darfst ein 2. Haus auf eins Deiner Grundstücke bauen, aber keine Miete dafür erheben. Steuerbegünstigter Leerstand um Geld in Umlauf zu bringen! Du kannst Kredit aufnehmen.", function() { secondHouse(amount=20000);}); //TODO
chanceCards2[11] = new Card("Hackerangriff\nDu hast die Bank gehackt und 80.000 erpresst. Die Bank schöpft das Geld durch Emission von Derivaten.", function() { receiveFromBank(80000);}); //TODO
chanceCards2[12] = new Card("Einbauküche\nDu kaufst für 24.000 eine Einbauküche. Überweise den Betrag anteilig an alle Mitspieler*innen", function() { payeachplayer(24000);});
chanceCards2[13] = new Card("Erbstreit\nWegen eines Erbstreits musst Du ein Grundstück versteigern. Die Hälfte des Erlöses zahlst du anteilig an alle aus.", function() { auctionHouse();}); //TODO
chanceCards2[14] = new Card("Beitragserhöhung\nDeine Krankenkasse erhöht die Beiträge. Zahle 3.000 an den Staat.", function() { payState(3000);});
