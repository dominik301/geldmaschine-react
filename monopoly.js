function Game() {
	var die1;
	var areDiceRolled = false;

	var derivateGesamt=0;
	var derivatePrivat=0;
	var derivateBank=0;
	var figuren;
	var zinssatz=10;

	this.rollDice = function() {
		die1 = Math.floor(Math.random() * 6) + 1;
		areDiceRolled = true;
	};

	this.resetDice = function() {
		areDiceRolled = false;
	};

	this.next = function() {
		if (!p.human && p.money < 0) {
			p.AI.payDebt();

			if (p.money < 0) {
				popup("<p>" + p.name + " is bankrupt. All of its assets will be turned over to " + player[p.creditor].name + ".</p>", game.bankruptcy);
			} else {
				roll();
			}
		} else if (areDiceRolled && doublecount === 0) {
			play();
		} else {
			roll();
		}
	};

	this.getDie = function() {
		return die1;
	};

	// Credit functions:

	var resetCredit = function(initiator) {

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

	};

	this.kreditAufnehmen = function() {
		if (isNaN(document.getElementById("credit-leftp-money").value)) {
			document.getElementById("credit-leftp-money").value = "This value must be a number.";
			document.getElementById("credit-leftp-money").style.color = "red";
			return false;
		}

		var creditObj = readCredit();
		var money = creditObj.getMoney();
		var initiator = player[turn];

		initiator.update()
		if (initiator.sumKredit + money > initiator.verfuegbareHypothek) {
			document.getElementById("credit-leftp-money").value = initiator.name + " does not have $" + money + ".";
			document.getElementById("credit-leftp-money").style.color = "red";
			return false;
		} 	

		if (initiator.human && !confirm(initiator.name + ", möchtest Du wirklich einen Kredit aufnehmen?")) {
			return false;
		}

		initiator.kreditAufnehmen(money);
	}

	this.kreditTilgen = function() {
		if (isNaN(document.getElementById("credit-leftp-money").value)) {
			document.getElementById("credit-leftp-money").value = "This value must be a number.";
			document.getElementById("credit-leftp-money").style.color = "red";
			return false;
		}

		var creditObj = readCredit();
		var money = creditObj.getMoney();
		var initiator = player[turn];

		if (money > initiator.money) {
			document.getElementById("credit-leftp-money").value = initiator.name + " does not have $" + money + ".";
			document.getElementById("credit-leftp-money").style.color = "red";
			return false;
		} 	

		if (initiator.human && !confirm(initiator.name + ", möchtest Du wirklich einen Kredit tilgen?")) {
			return false;
		}

		initiator.kreditTilgen(money);		
	}

	// Trade functions:



	var currentInitiator;
	var currentRecipient;

	// Define event handlers:

	var tradeMoneyOnKeyDown = function (e) {
		var key = 0;
		var isCtrl = false;
		var isShift = false;

		if (window.event) {
			key = window.event.keyCode;
			isCtrl = window.event.ctrlKey;
			isShift = window.event.shiftKey;
		} else if (e) {
			key = e.keyCode;
			isCtrl = e.ctrlKey;
			isShift = e.shiftKey;
		}

		if (isNaN(key)) {
			return true;
		}

		if (key === 13) {
			return false;
		}

		// Allow backspace, tab, delete, arrow keys, or if control was pressed, respectively.
		if (key === 8 || key === 9 || key === 46 || (key >= 35 && key <= 40) || isCtrl) {
			return true;
		}

		if (isShift) {
			return false;
		}

		// Only allow number keys.
		return (key >= 48 && key <= 57) || (key >= 96 && key <= 105);
	};

	var tradeMoneyOnFocus = function () {
		this.style.color = "black";
		if (isNaN(this.value) || this.value === "0") {
			this.value = "";
		}
	};

	var tradeMoneyOnChange = function(e) {
		$("#proposetradebutton").show();
		$("#canceltradebutton").show();
		$("#accepttradebutton").hide();
		$("#rejecttradebutton").hide();

		var amount = this.value;

		if (isNaN(amount)) {
			this.value = "This value must be a number.";
			this.style.color = "red";
			return false;
		}

		amount = Math.round(amount) || 0;
		this.value = amount;

		if (amount < 0) {
			this.value = "This value must be greater than 0.";
			this.style.color = "red";
			return false;
		}

		return true;
	};

	document.getElementById("trade-leftp-money").onkeydown = tradeMoneyOnKeyDown;
	document.getElementById("trade-rightp-money").onkeydown = tradeMoneyOnKeyDown;
	document.getElementById("trade-leftp-money").onfocus = tradeMoneyOnFocus;
	document.getElementById("trade-rightp-money").onfocus = tradeMoneyOnFocus;
	document.getElementById("trade-leftp-money").onchange = tradeMoneyOnChange;
	document.getElementById("trade-rightp-money").onchange = tradeMoneyOnChange;

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

		if (pcount === 2) {
			document.getElementById("stats").style.width = "454px";
		} else if (pcount === 3) {
			document.getElementById("stats").style.width = "686px";
		}

		if (pcount === 1) {
			updateMoney();
			$("#control").hide();
			$("#board").hide();
			$("#refresh").show();

			popup("<p>Congratulations, " + player[1].name + ", you have won the game.</p><div>");

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

		popup(HTML, game.eliminatePlayer);
	};

	this.resign = function() {
		popup("<p>Are you sure you want to resign?</p>", game.bankruptcy, "Yes/No");
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

		if (pcount === 2 || bankruptcyUnmortgageFee === 0 || p.creditor === 0) {
			game.eliminatePlayer();
		} else {
			addAlert(pcredit.name + " paid $" + bankruptcyUnmortgageFee + " interest on the mortgaged properties received from " + p.name + ".");
			popup("<p>" + pcredit.name + ", you must pay $" + bankruptcyUnmortgageFee + " interest on the mortgaged properties you received from " + p.name + ".</p>", function() {player[pcredit.index].pay(bankruptcyUnmortgageFee, 0); game.bankruptcyUnmortgage();});
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
		if (this.sumKredit + amount <= this.verfuegbareHypothek) {
			this.money += amount;
			this.sumKredit += amount;

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
	//this.sumKredit = 0; //equals this.money
	this.kreditTilgung = 0;
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
		this.zinsenLotto -= amount;
		this.update()
	};

	this.buyAnleihen = function (amount) {
		this.anleihenBank += amount;
		this.zinsenLotto -= amount;
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
	$alert = $("#alert");

	$(document.createElement("div")).text(alertText).appendTo($alert);

	// Animate scrolling down alert element.
	$alert.stop().animate({"scrollTop": $alert.prop("scrollHeight")}, 1000);

	if (!player[turn].human) {
		player[turn].AI.alertList += "<div>" + alertText + "</div>";
	}
}

function popup(HTML, action, option) {
	document.getElementById("popuptext").innerHTML = HTML;
	document.getElementById("popup").style.width = "300px";
	document.getElementById("popup").style.top = "0px";
	document.getElementById("popup").style.left = "0px";

	if (!option && typeof action === "string") {
		option = action;
	}

	option = option ? option.toLowerCase() : "";

	if (typeof action !== "function") {
		action = null;
	}

	// Yes/No
	if (option === "yes/no") {
		document.getElementById("popuptext").innerHTML += "<div><input type=\"button\" value=\"Yes\" id=\"popupyes\" /><input type=\"button\" value=\"No\" id=\"popupno\" /></div>";

		$("#popupyes, #popupno").on("click", function() {
			$("#popupwrap").hide();
			$("#popupbackground").fadeOut(400);
		});

		$("#popupyes").on("click", action);

	// Ok
	} else if (option !== "blank") {
		$("#popuptext").append("<div><input type='button' value='OK' id='popupclose' /></div>");
		$("#popupclose").focus();

		$("#popupclose").on("click", function() {
			$("#popupwrap").hide();
			$("#popupbackground").fadeOut(400);
		}).on("click", action);

	}

	// Show using animation.
	$("#popupbackground").fadeIn(400, function() {
		$("#popupwrap").show();
	});

}


function updatePosition() {
	// Reset borders
	for (var i = 0; i < 12; i++) {
		document.getElementById("cell" + i).style.border = "1px solid black";
		document.getElementById("cell" + i + "positionholder").innerHTML = "";

	}

	var sq, left, top;

	for (var x = 0; x < 12; x++) {
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
	}

	left = 0;
	top = 53;

	p = player[turn];

	document.getElementById("cell" + p.position).style.border = "1px solid " + p.color;	

	// for (var i=1; i <= pcount; i++) {
	// document.getElementById("enlarge"+player[i].position+"token").innerHTML+="<img src='"+tokenArray[i].src+"' height='30' width='30' />";
	// }
}

function updateMoney() {
	var p = player[turn];

	document.getElementById("pmoney").innerHTML = "$" + p.money;
	$(".money-bar-row").hide();

	for (var i = 1; i <= pcount; i++) {
		p_i = player[i];

		$("#moneybarrow" + i).show();
		document.getElementById("p" + i + "moneybar").style.border = "2px solid " + p_i.color;
		document.getElementById("p" + i + "money").innerHTML = p_i.money;
		document.getElementById("p" + i + "moneyname").innerHTML = p_i.name;
	}

	if (document.getElementById("landed").innerHTML === "") {
		$("#landed").hide();
	}

	document.getElementById("quickstats").style.borderColor = p.color;

	if (p.money < 0) {
		// document.getElementById("nextbutton").disabled = true;
		$("#resignbutton").show();
		$("#nextbutton").hide();
	} else {
		// document.getElementById("nextbutton").disabled = false;
		$("#resignbutton").hide();
		$("#nextbutton").show();
	}
}

function updateDice() {
	var die0 = game.getDie();

	$("#die0").show();

	if (document.images) {
		var element0 = document.getElementById("die0");

		element0.classList.remove("die-no-img");

		element0.title = "Die (" + die0 + " spots)";

		if (element0.firstChild) {
			element0 = element0.firstChild;
		} else {
			element0 = element0.appendChild(document.createElement("img"));
		}

		element0.src = "images/Die_" + die0 + ".png";
		element0.alt = die0;
	} else {
		document.getElementById("die0").textContent = die0;

		document.getElementById("die0").title = "Die";
	}
}

function updateOwned() {
	var p = player[turn];
	var checkedproperty = getCheckedProperty();
	$("#option").show();
	$("#owned").show();

	var HTML = "",
	firstproperty = -1;

	var mortgagetext = "",
	housetext = "";
	var sq;

	for (var i = 0; i < 12; i++) {
		sq = square[i];
		if (sq.groupNumber && sq.owner === 0) {
			$("#cell" + i + "owner").hide();
		} else if (sq.groupNumber && sq.owner > 0) {
			var currentCellOwner = document.getElementById("cell" + i + "owner");

			currentCellOwner.style.display = "block";
			currentCellOwner.style.backgroundColor = player[sq.owner].color;
			currentCellOwner.title = player[sq.owner].name;
		}
	}

	for (var i = 0; i < 12; i++) {
		sq = square[i];
		if (sq.owner == turn) {

			mortgagetext = "";
			if (sq.mortgage) {
				mortgagetext = "title='Mortgaged' style='color: grey;'";
			}

			housetext = "";
			if (sq.house >= 1 && sq.house <= 2) {
				for (var x = 1; x <= sq.house; x++) {
					housetext += "<img src='images/house.png' alt='' title='House' class='house' />";
				}
			} 

			if (HTML === "") {
				HTML += "<table>";
				firstproperty = i;
			}

			HTML += "<tr class='property-cell-row'><td class='propertycellcheckbox'><input type='checkbox' id='propertycheckbox" + i + "' /></td><td class='propertycellcolor' style='background: " + sq.color + ";";

			HTML += "' onmouseover='showdeed(" + i + ");' onmouseout='hidedeed();'></td><td class='propertycellname' " + mortgagetext + ">" + sq.name + housetext + "</td></tr>";
		}
	}

	if (HTML === "") {
		HTML = p.name + ", you don't have any properties.";
		$("#option").hide();
	} else {
		HTML += "</table>";
	}

	document.getElementById("owned").innerHTML = HTML;

	// Select previously selected property.
	if (checkedproperty > -1 && document.getElementById("propertycheckbox" + checkedproperty)) {
		document.getElementById("propertycheckbox" + checkedproperty).checked = true;
	} else if (firstproperty > -1) {
		document.getElementById("propertycheckbox" + firstproperty).checked = true;
	}
	$(".property-cell-row").click(function() {
		var row = this;

		// Toggle check the current checkbox.
		$(this).find(".propertycellcheckbox > input").prop("checked", function(index, val) {
			return !val;
		});

		// Set all other checkboxes to false.
		$(".propertycellcheckbox > input").prop("checked", function(index, val) {
			if (!$.contains(row, this)) {
				return false;
			}
		});

		updateOption();
	});
	updateOption();
}

function updateOption() {
	$("#option").show();

	var allGroupUninproved = true;
	var allGroupUnmortgaged = true;
	var checkedproperty = getCheckedProperty();

	if (checkedproperty < 0 || checkedproperty >= 12) {
		$("#buyhousebutton").hide();
		$("#sellhousebutton").hide();
		$("#mortgagebutton").hide();

		return;
	}

	$("#buildings").hide();
	var sq = square[checkedproperty];

	buyhousebutton = document.getElementById("buyhousebutton");
	sellhousebutton = document.getElementById("sellhousebutton");

	$("#mortgagebutton").show();
	document.getElementById("mortgagebutton").disabled = false;

	if (sq.mortgage) {
		document.getElementById("mortgagebutton").value = "Unmortgage ($" + sq.price + ")";
		document.getElementById("mortgagebutton").title = "Unmortgage " + sq.name + " for $" + sq.price + ".";
		$("#buyhousebutton").hide();
		$("#sellhousebutton").hide();

		allGroupUnmortgaged = false;
	} else {
		document.getElementById("mortgagebutton").value = "Mortgage ($" + sq.price + ")";
		document.getElementById("mortgagebutton").title = "Mortgage " + sq.name + " for $" + sq.price + ".";
	}

		
	$("#buyhousebutton").show();
	$("#sellhousebutton").show();
	buyhousebutton.disabled = false;
	sellhousebutton.disabled = false;

	if (sq.house == 0) {
		$("#sellhousebutton").hide();
		buyhousebutton.value = "Buy house (" + sq.houseprice + ")";
		buyhousebutton.title = "Buy a house for " + sq.houseprice;
	}
	

	if (sq.house >= 1) {
		$("#buyhousebutton").hide();
		sellhousebutton.value = "Sell house (" + (sq.houseprice) + ")";
		sellhousebutton.title = "Sell a house for " + (sq.houseprice);

		$("#mortgagebutton").show();
		document.getElementById("mortgagebutton").disabled = false;

		if (sq.mortgage) {
			document.getElementById("mortgagebutton").value = "Unmortgage ($" + sq.price + ")";
			document.getElementById("mortgagebutton").title = "Unmortgage " + sq.name + " for $" + sq.price + ".";
			$("#buyhousebutton").hide();
			$("#sellhousebutton").hide();

			allGroupUnmortgaged = false;
		} else {
			document.getElementById("mortgagebutton").value = "Mortgage ($" + sq.price + ")";
			document.getElementById("mortgagebutton").title = "Mortgage " + sq.name + " for $" + sq.price + ".";
		}
	}
	
}

function chanceAction(chanceIndex) {
	var p = player[turn]; // This is needed for reference in action() method.

	// $('#popupbackground').hide();
	// $('#popupwrap').hide();
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

function collectfromeachplayer(amount, cause) {
	var p = player[turn];
	var total = 0;

	for (var i = 1; i <= pcount; i++) {
		if (i != turn) {
			money = player[i].money;
			if (money < amount) {
				p.money += money;
				total += money;
				player[i].money = 0;
			} else {
				player[i].pay(amount, turn);
				p.money += amount;
				total += amount;
			}
		}
	}

	addAlert(p.name + " received $" + total + " from " + cause + ".");
}

function advance(destination, pass) {
	var p = player[turn];

	if (typeof pass === "number") {
		if (p.position < pass) {
			p.position = pass;
		} else {
			p.position = pass;
			p.money += 200;
			addAlert(p.name + " collected a $200 salary for passing GO.");
		}
	}
	if (p.position < destination) {
		p.position = destination;
	} else {
		p.position = destination;
		p.money += 200;
		addAlert(p.name + " collected a $200 salary for passing GO.");
	}

	land();
}

function streetrepairs(houseprice, hotelprice) {
	var cost = 0;
	for (var i = 0; i < 12; i++) {
		var s = square[i];
		if (s.owner == turn) {
			if (s.hotel == 1)
				cost += hotelprice;
			else
				cost += s.house * houseprice;
		}
	}

	var p = player[turn];

	if (cost > 0) {
		p.pay(cost, 0);

		// If function was called by Community Chest.
		if (houseprice === 40) {
			addAlert(p.name + " lost $" + cost + " to Community Chest.");
		} else {
			addAlert(p.name + " lost $" + cost + " to Chance.");
		}
	}

}

function payplayer(position, amount) {
	var receiver = turn + position;
	var nPlayer = player.length

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

	p.pay(amount, 0); //TODO: Staat

	addAlert(p.name + " lost $" + amount + ".");
}

function receiveBankguthaben() {
	p.money += meineBank.zinsenLotto;
	meineBank.zinsenLotto = 0;
}

function buyHouse(index) {
	var sq = square[index];
	var p = player[sq.owner];

	if (p.money - sq.houseprice < 0) {
		if (sq.house == 4) {
			return false;
		} else {
			return false;
		}

	} else {

		if (sq.house < 1) {
			sq.house++;
			addAlert(p.name + " placed a house on " + sq.name + ".");
		} else {
			return;
		}

		p.pay(sq.houseprice, 0);

		updateOwned();
		updateMoney();
	}
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
					housetext += "<span style='float: right; font-weight: bold;'>" + sq.house + "&nbsp;x&nbsp;<img src='images/house.png' alt='' title='House' class='house' style='float: none;' /></span>";
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

	document.getElementById("statstext").innerHTML = HTML;
	// Show using animation.
	$("#statsbackground").fadeIn(400, function() {
		$("#statswrap").show();
	});
}

function showdeed(property) {
	var sq = square[property];
	$("#deed").show();

	$("#deed-normal").hide();
	$("#deed-mortgaged").hide();
	$("#deed-special").hide();

	if (sq.mortgage) {
		$("#deed-mortgaged").show();
		document.getElementById("deed-mortgaged-name").textContent = sq.name;
		document.getElementById("deed-mortgaged-mortgage").textContent = (sq.price / 2);

	} else {

		$("#deed-normal").show();
		document.getElementById("deed-header").style.backgroundColor = sq.color;
		document.getElementById("deed-name").textContent = sq.name;
		document.getElementById("deed-rent").textContent = sq.rent;
		document.getElementById("deed-mortgage").textContent = (sq.price);
		document.getElementById("deed-houseprice").textContent = sq.houseprice;
	}
}

function hidedeed() {
	$("#deed").hide();
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

		$("#landed").hide();

	} else {
		popup("<p>" + p.name + ", you need $" + (property.price - p.money) + " more to buy " + property.name + ".</p>");
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

	document.getElementById("mortgagebutton").value = "Unmortgage for $" + mortgagePrice;
	document.getElementById("mortgagebutton").title = "Unmortgage " + sq.name + " for $" + mortgagePrice + ".";

	addAlert(p.name + " mortgaged " + sq.name + " for $" + mortgagePrice + ".");
	updateOwned();
	updateMoney();

	return true;
}

/*function mortgageHouse(index) {
	var sq = square[index];
	var p = player[sq.owner];

	if (sq.mortgageHouse) {
		return false;
	}

	var mortgagePrice = sq.houseprice;

	sq.mortgageHouse = true;
	p.money += mortgagePrice;

	document.getElementById("mortgagebutton").value = "Unmortgage house for $" + mortgagePrice;
	document.getElementById("mortgagebutton").title = "Unmortgage house " + sq.name + " for $" + mortgagePrice + ".";

	addAlert(p.name + " mortgaged house on " + sq.name + " for $" + mortgagePrice + ".");
	updateOwned();
	updateMoney();

	return true;
}*/

function unmortgage(index) {
	var sq = square[index];
	var p = player[sq.owner];
	var mortgagePrice = sq.price;

	if (mortgagePrice > p.money || !sq.mortgage) {
		return false;
	}

	p.pay(mortgagePrice, 0);
	sq.mortgage = false;
	document.getElementById("mortgagebutton").value = "Mortgage for $" + mortgagePrice;
	document.getElementById("mortgagebutton").title = "Mortgage " + sq.name + " for $" + mortgagePrice + ".";

	addAlert(p.name + " unmortgaged " + sq.name + " for $" + unmortgagePrice + ".");
	updateOwned();
	return true;
}

/*function unmortgageHouse(index) {
	var sq = square[index];
	var p = player[sq.owner];
	var mortgagePrice = sq.houseprice;

	if (mortgagePrice > p.money || !sq.mortgageHouse) {
		return false;
	}

	p.pay(mortgagePrice, 0);
	sq.mortgageHouse = false;
	document.getElementById("mortgagehousebutton").value = "Mortgage house for $" + mortgagePrice;
	document.getElementById("mortgagehousebutton").title = "Mortgage house " + sq.name + " for $" + mortgagePrice + ".";

	addAlert(p.name + " unmortgaged house on " + sq.name + " for $" + unmortgagePrice + ".");
	updateOwned();
	return true;
}*/

function land(increasedRent) {
	increasedRent = !!increasedRent; // Cast increasedRent to a boolean value. It is used for the ADVANCE TO THE NEAREST RAILROAD/UTILITY Chance cards.

	var p = player[turn];
	var s = square[p.position];

	$("#landed").show();
	document.getElementById("landed").innerHTML = "You landed on " + s.name + ".";
	s.landcount++;
	addAlert(p.name + " landed on " + s.name + ".");

	// Allow player to buy the property on which he landed.
	if (s.price !== 0 && s.owner === 0) {

		if (!p.human) {

			if (p.AI.buyProperty(p.position)) {
				buy();
			}
		} else {
			document.getElementById("landed").innerHTML = "<div>You landed on <a href='javascript:void(0);' onmouseover='showdeed(" + p.position + ");' onmouseout='hidedeed();' class='statscellcolor'>" + s.name + "</a>.<input type='button' onclick='buy();' value='Buy ($" + s.price + ")' title='Buy " + s.name + " for " + s.pricetext + ".'/></div>";
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

		document.getElementById("landed").innerHTML = "You landed on " + s.name + ". " + player[s.owner].name + " collected $" + rent + " rent.";
	}

	// City Tax
	if (p.position === 4) {
		citytax();
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

		popup("<img src='images/chance_icon.png' style='height: 50px; width: 26px; float: left; margin: 8px 8px 8px 0px;' /><div style='font-weight: bold; font-size: 16px; '>Chance:</div><div style='text-align: justify;'>" + chanceCards[chanceIndex].text + "</div>", function() {
			chanceAction(chanceIndex);
		});

		chanceCards.index++;

		if (chanceCards.index >= chanceCards.deck.length) {
			chanceCards.index = 0;
		}
	}
}

function roll() {
	var p = player[turn];

	$("#option").hide();
	$("#buy").show();
	$("#manage").hide();

	if (p.human) {
		document.getElementById("nextbutton").focus();
	}
	document.getElementById("nextbutton").value = "End turn";
	document.getElementById("nextbutton").title = "End turn and advance to the next player.";

	game.rollDice();
	var die1 = game.getDie();

	doublecount++;

	addAlert(p.name + " rolled " + die1 + ".");

	
	document.getElementById("nextbutton").value = "End turn";
	document.getElementById("nextbutton").title = "End turn and advance to the next player.";
	doublecount = 0;

	updatePosition();
	updateMoney();
	updateOwned();

	
	updateDice(die1);

	// Move player
	p.position += die1;

	//TODO
	// Collect $200 salary as you pass GO
	if (p.position >= 12) {
		p.position -= 12;
		p.money += 200;
		addAlert(p.name + " collected a $200 salary for passing GO.");
	}

	land();
}

function play() {

	turn++;
	if (turn > pcount) {
		turn -= pcount;
	}

	var p = player[turn];
	game.resetDice();

	document.getElementById("pname").innerHTML = p.name;

	addAlert("It is " + p.name + "'s turn.");

	// Check for bankruptcy.
	p.pay(0, p.creditor);

	$("#landed, #option, #manage").hide();
	$("#board, #control, #moneybar, #viewstats, #buy").show();

	doublecount = 0;
	if (p.human) {
		document.getElementById("nextbutton").focus();
	}
	document.getElementById("nextbutton").value = "Roll Dice";
	document.getElementById("nextbutton").title = "Roll the dice and move your token accordingly.";

	$("#die0").hide();	

	updateMoney();
	updatePosition();
	updateOwned();

	$(".money-bar-arrow").hide();
	$("#p" + turn + "arrow").show();

}

function setup() {
	pcount = parseInt(document.getElementById("playernumber").value, 10);

	var playerArray = new Array(pcount);
	var p;

	playerArray.randomize();

	var properties = new Array(1,2,4,5,7,8,10,11);
	properties.sort(function() { return 0.5 - Math.random();});

	for (var i = 1; i <= pcount; i++) {
		p = player[playerArray[i - 1]];


		p.color = document.getElementById("player" + i + "color").value.toLowerCase();

		if (document.getElementById("player" + i + "ai").value === "0") {
			p.name = document.getElementById("player" + i + "name").value;
			p.human = true;
		}

		//Immobilienkarten verteilen
		var n = pcount <= 4 ? 2 : 1;
		for (var j = 0; j < n; j++) {
			var pos = properties.pop();
			var property = square[pos];

			property.owner = playerArray[i - 1];
			addAlert(p.name + " received " + property.name + ".");

			//updateOwned();
		}
		
		//end:Immobilienkarten verteilen
	}

	$("#board, #moneybar").show();
	$("#setup").hide();
	
	if (pcount === 3) {
		document.getElementById("stats").style.width = "686px";
	}

	document.getElementById("stats").style.top = "0px";
	document.getElementById("stats").style.left = "0px";

	play();
}

function getCheckedProperty() {
	for (var i = 0; i < 12; i++) {
		if (document.getElementById("propertycheckbox" + i) && document.getElementById("propertycheckbox" + i).checked) {
			return i;
		}
	}
	return -1; // No property is checked.
}

function playernumber_onchange() {
	pcount = parseInt(document.getElementById("playernumber").value, 10);

	$(".player-input").hide();

	for (var i = 1; i <= pcount; i++) {
		$("#player" + i + "input").show();
	}
}

function menuitem_onmouseover(element) {
	element.className = "menuitem menuitem_hover";
	return;
}

function menuitem_onmouseout(element) {
	element.className = "menuitem";
	return;
}

window.onload = function() {
	game = new Game();

	for (var i = 0; i <= 7; i++) {
		player[i] = new Player("", "");
		player[i].index = i;
	}

	var groupPropertyArray = [];
	var groupNumber;

	for (var i = 0; i < 12; i++) {
		groupNumber = square[i].groupNumber;

		if (groupNumber > 0) {
			if (!groupPropertyArray[groupNumber]) {
				groupPropertyArray[groupNumber] = [];
			}

			groupPropertyArray[groupNumber].push(i);
		}
	}

	for (var i = 0; i < 12; i++) {
		groupNumber = square[i].groupNumber;

		if (groupNumber > 0) {
			square[i].group = groupPropertyArray[groupNumber];
		}

		square[i].index = i;
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

	$("#playernumber").on("change", playernumber_onchange);
	playernumber_onchange();

	$("#nextbutton").click(game.next);
	$("#noscript").hide();
	$("#setup, #noF5").show();

	var enlargeWrap = document.body.appendChild(document.createElement("div"));

	enlargeWrap.id = "enlarge-wrap";

	var HTML = "";
	for (var i = 0; i < 12; i++) {
		HTML += "<div id='enlarge" + i + "' class='enlarge'>";
		HTML += "<div id='enlarge" + i + "color' class='enlarge-color'></div><br /><div id='enlarge" + i + "name' class='enlarge-name'></div>";
		HTML += "<br /><div id='enlarge" + i + "price' class='enlarge-price'></div>";
		HTML += "<br /><div id='enlarge" + i + "token' class='enlarge-token'></div></div>";
	}

	enlargeWrap.innerHTML = HTML;

	var currentCell;
	var currentCellAnchor;
	var currentCellPositionHolder;
	var currentCellName;
	var currentCellOwner;

	for (var i = 0; i < 12; i++) {
		s = square[i];

		currentCell = document.getElementById("cell" + i);

		currentCellAnchor = currentCell.appendChild(document.createElement("div"));
		currentCellAnchor.id = "cell" + i + "anchor";
		currentCellAnchor.className = "cell-anchor";

		currentCellPositionHolder = currentCellAnchor.appendChild(document.createElement("div"));
		currentCellPositionHolder.id = "cell" + i + "positionholder";
		currentCellPositionHolder.className = "cell-position-holder";
		currentCellPositionHolder.enlargeId = "enlarge" + i;

		currentCellName = currentCellAnchor.appendChild(document.createElement("div"));
		currentCellName.id = "cell" + i + "name";
		currentCellName.className = "cell-name";
		currentCellName.textContent = s.name;

		if (square[i].groupNumber) {
			currentCellOwner = currentCellAnchor.appendChild(document.createElement("div"));
			currentCellOwner.id = "cell" + i + "owner";
			currentCellOwner.className = "cell-owner";
		}

		document.getElementById("enlarge" + i + "color").style.backgroundColor = s.color;
		document.getElementById("enlarge" + i + "name").textContent = s.name;
		document.getElementById("enlarge" + i + "price").textContent = s.pricetext;
	}


	// Add images to enlarges.
	document.getElementById("enlarge0token").innerHTML += '<img src="images/arrow_icon.png" height="40" width="136" alt="" />';
	document.getElementById("enlarge6token").innerHTML += '<img src="images/tax_icon.png" height="60" width="70" alt="" style="position: relative; top: -20px;" />';

	corrections();

	// Create event handlers for hovering and draging.

	var drag, dragX, dragY, dragObj, dragTop, dragLeft;


	$("body").on("mousemove", function(e) {
		var object;

		if (e.target) {
			object = e.target;
		} else if (window.event && window.event.srcElement) {
			object = window.event.srcElement;
		}


		if (object.classList.contains("propertycellcolor") || object.classList.contains("statscellcolor")) {
			if (e.clientY + 20 > window.innerHeight - 279) {
				document.getElementById("deed").style.top = (window.innerHeight - 279) + "px";
			} else {
				document.getElementById("deed").style.top = (e.clientY + 20) + "px";
			}
			document.getElementById("deed").style.left = (e.clientX + 10) + "px";


		} else if (drag) {
			if (e) {
				dragObj.style.left = (dragLeft + e.clientX - dragX) + "px";
				dragObj.style.top = (dragTop + e.clientY - dragY) + "px";

			} else if (window.event) {
				dragObj.style.left = (dragLeft + window.event.clientX - dragX) + "px";
				dragObj.style.top = (dragTop + window.event.clientY - dragY) + "px";
			}
		}
	});


	$("body").on("mouseup", function() {

		drag = false;
	});
	document.getElementById("statsdrag").onmousedown = function(e) {
		dragObj = document.getElementById("stats");
		dragObj.style.position = "relative";

		dragTop = parseInt(dragObj.style.top, 10) || 0;
		dragLeft = parseInt(dragObj.style.left, 10) || 0;

		if (window.event) {
			dragX = window.event.clientX;
			dragY = window.event.clientY;
		} else if (e) {
			dragX = e.clientX;
			dragY = e.clientY;
		}

		drag = true;
	};

	document.getElementById("popupdrag").onmousedown = function(e) {
		dragObj = document.getElementById("popup");
		dragObj.style.position = "relative";

		dragTop = parseInt(dragObj.style.top, 10) || 0;
		dragLeft = parseInt(dragObj.style.left, 10) || 0;

		if (window.event) {
			dragX = window.event.clientX;
			dragY = window.event.clientY;
		} else if (e) {
			dragX = e.clientX;
			dragY = e.clientY;
		}

		drag = true;
	};

	$("#mortgagebutton").click(function() {
		var checkedProperty = getCheckedProperty();
		var s = square[checkedProperty];

		if (s.mortgage) {
			if (player[s.owner].money < s.houseprice) {
				popup("<p>You need $" + (s.price - player[s.owner].money) + " more to unmortgage " + s.name + ".</p>");

			} else {
				popup("<p>" + player[s.owner].name + ", are you sure you want to unmortgage " + s.name + " for $" + s.price + "?</p>", function() {
					unmortgage(checkedProperty);
				}, "Yes/No");
			}
		} else {
			popup("<p>" + player[s.owner].name + ", are you sure you want to mortgage " + s.name + " for $" + s.price + "?</p>", function() {
				mortgage(checkedProperty);
			}, "Yes/No");
		}

	});

	$("#buyhousebutton").on("click", function() {
		var checkedProperty = getCheckedProperty();
		var s = square[checkedProperty];
		var p = player[s.owner];
		var houseSum = 0;
		var hotelSum = 0;

		if (p.money < s.houseprice) {
			if (s.house === 4) {
				popup("<p>You need $" + (s.houseprice - player[s.owner].money) + " more to buy a hotel for " + s.name + ".</p>");
				return;
			} else {
				popup("<p>You need $" + (s.houseprice - player[s.owner].money) + " more to buy a house for " + s.name + ".</p>");
				return;
			}
		}

		for (var i = 0; i < 12; i++) {
			if (square[i].hotel === 1) {
				hotelSum++;
			} else {
				houseSum += square[i].house;
			}
		}

		if (s.house < 4 && houseSum >= 32) {
			popup("<p>All 32 houses are owned. You must wait until one becomes available.</p>");
			return;
		} else if (s.house === 4 && hotelSum >= 12) {
			popup("<p>All 12 hotels are owned. You must wait until one becomes available.</p>");
			return;
		}

		buyHouse(checkedProperty);

	});

	$("#sellhousebutton").click(function() { sellHouse(getCheckedProperty()); });

	/*$("#mortgagehousebutton").click(function() {
		var checkedProperty = getCheckedProperty();
		var s = square[checkedProperty];

		if (s.mortgageHouse) {
			if (player[s.owner].money < s.houseprice) {
				popup("<p>You need $" + (s.price - player[s.owner].money) + " more to unmortgage " + s.name + ".</p>");

			} else {
				popup("<p>" + player[s.owner].name + ", are you sure you want to unmortgage " + s.name + " for $" + s.price + "?</p>", function() {
					unmortgageHouse(checkedProperty);
				}, "Yes/No");
			}
		} else {
			popup("<p>" + player[s.owner].name + ", are you sure you want to mortgage " + s.name + " for $" + s.price + "?</p>", function() {
				mortgageHouse(checkedProperty);
			}, "Yes/No");
		}

	});*/

	$("#viewstats").on("click", showStats);
	$("#statsclose, #statsbackground").on("click", function() {
		$("#statswrap").hide();
		$("#statsbackground").fadeOut(400);
	});

	$("#buy-menu-item").click(function() {
		$("#buy").show();
		$("#manage").hide();

		// Scroll alerts to bottom.
		$("#alert").scrollTop($("#alert").prop("scrollHeight"));
	});


	$("#manage-menu-item").click(function() {
		$("#manage").show();
		$("#buy").hide();
	});


	$("#trade-menu-item").click(game.trade);

	$("#credit-menu-item").click(game.credit);


};
