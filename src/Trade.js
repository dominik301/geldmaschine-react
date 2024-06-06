import React from 'react';

function showTradeMenu() {
      $("#proposetradebutton").show();
      $("#canceltradebutton").show();
      $("#accepttradebutton").hide();
      $("#rejecttradebutton").hide();
    
      socket.emit('updateSquare');
      socket.emit('updatePlayer');
      setTimeout(() => { finishTradeMenu();}, 200);
    };

var currentInitiator;
var currentRecipient;

var tradeObj;

socket.on('tradeObj', function(data) {
    tradeObj = data;
});

function readTrade() {
  var initiator = currentInitiator;
  var recipient = currentRecipient;
  var property = new Array(12);
  var money;
  var anleihen;
  var derivate;
  var assets = []

  for (var i = 0; i < 12; i++) {

      if (document.getElementById("tradeleftcheckbox" + i) && document.getElementById("tradeleftcheckbox" + i).checked) {
          property[i] = 1;
      } else if (document.getElementById("traderightcheckbox" + i) && document.getElementById("traderightcheckbox" + i).checked) {
          property[i] = -1;
      } else {
          property[i] = 0;
      }
  }

  if (document.getElementById("tradeleftcheckboxM") && document.getElementById("tradeleftcheckboxM").checked) {
      assets[0] = 1;
  } else if (document.getElementById("traderightcheckboxM") && document.getElementById("traderightcheckboxM").checked) {
      assets[0] = -1;
  } else {
      assets[0] = 0;
  }
  if (document.getElementById("tradeleftcheckboxA") && document.getElementById("tradeleftcheckboxA").checked) {
      assets[1] = 1;
  } else if (document.getElementById("traderightcheckboxA") && document.getElementById("traderightcheckboxA").checked) {
      assets[1] = -1;
  } else {
      assets[1] = 0;
  }
  if (document.getElementById("tradeleftcheckboxY") && document.getElementById("tradeleftcheckboxY").checked) {
      assets[2] = 1;
  } else if (document.getElementById("traderightcheckboxY") && document.getElementById("traderightcheckboxY").checked) {
      assets[2] = -1;
  } else {
      assets[2] = 0;
  }

  if (assets[2] == 0 && assets[1] == 0 && assets[0] == 0)
      assets = []

  money = parseInt(document.getElementById("trade-leftp-money").value, 10) || 0;
  money -= parseInt(document.getElementById("trade-rightp-money").value, 10) || 0;

  anleihen = parseInt(document.getElementById("trade-leftp-anleihen").value, 10) || 0;
  anleihen -= parseInt(document.getElementById("trade-rightp-anleihen").value, 10) || 0;

  derivate = parseInt(document.getElementById("trade-leftp-derivate").value, 10) || 0;
  derivate -= parseInt(document.getElementById("trade-rightp-derivate").value, 10) || 0;
  
  socket.emit('newTrade', initiator, recipient, money, property, anleihen, derivate, assets);
};

function writeTrade(tradeObj) {
  resetTrade(tradeObj.initiator, tradeObj.recipient, false);

  for (var i = 0; i < 12; i++) {

      if (document.getElementById("tradeleftcheckbox" + i)) {
          document.getElementById("tradeleftcheckbox" + i).checked = false;
          if (tradeObj.property[i] === 1) {
              document.getElementById("tradeleftcheckbox" + i).checked = true;
          }
      }

      if (document.getElementById("traderightcheckbox" + i)) {
          document.getElementById("traderightcheckbox" + i).checked = false;
          if (tradeObj.property[i]=== -1) {
              document.getElementById("traderightcheckbox" + i).checked = true;
          }
      }
  }

  if (document.getElementById("tradeleftcheckboxM")) {
      document.getElementById("tradeleftcheckboxM").checked = false;
      if (tradeObj.assets[0] > 0) {
          document.getElementById("tradeleftcheckboxM").checked = true;
      }
  }

  if (document.getElementById("traderightcheckboxM")) {
      document.getElementById("traderightcheckboxM").checked = false;
      if (tradeObj.assets[0] < 0) {
          document.getElementById("traderightcheckboxM").checked = true;
      }
  }
  
  if (document.getElementById("tradeleftcheckboxA")) {
      document.getElementById("tradeleftcheckboxA").checked = false;
      if (tradeObj.assets[1] > 0) {
          document.getElementById("tradeleftcheckboxA").checked = true;
      }
  }

  if (document.getElementById("traderightcheckboxA")) {
      document.getElementById("traderightcheckboxA").checked = false;
      if (tradeObj.assets[1] < 0) {
          document.getElementById("traderightcheckboxA").checked = true;
      }
  }

  if (document.getElementById("tradeleftcheckboxY")) {
      document.getElementById("tradeleftcheckboxY").checked = false;
      if (tradeObj.assets[2] > 0) {
          document.getElementById("tradeleftcheckboxY").checked = true;
      }
  }

  if (document.getElementById("traderightcheckboxY")) {
      document.getElementById("traderightcheckboxY").checked = false;
      if (tradeObj.assets[2] < 0) {
          document.getElementById("traderightcheckboxY").checked = true;
      }
  }

  if (tradeObj.money > 0) {
      document.getElementById("trade-leftp-money").value = tradeObj.money + "";
  } else {
      document.getElementById("trade-rightp-money").value = (-tradeObj.money) + "";
  }

  if (tradeObj.anleihen > 0) {
      document.getElementById("trade-leftp-anleihen").value = tradeObj.anleihen + "";
  } else {
      document.getElementById("trade-rightp-anleihen").value = (-tradeObj.anleihen) + "";
  }
  if (tradeObj.derivate > 0) {
      document.getElementById("trade-leftp-derivate").value = tradeObj.derivate + "";
  } else {
      document.getElementById("trade-rightp-derivate").value = (-tradeObj.derivate) + "";
  }
};

function proposeTrade() {
  if (isNaN(document.getElementById("trade-leftp-money").value)) {
      document.getElementById("trade-leftp-money").value = "Der Wert muss eine Zahl sein.";
      document.getElementById("trade-leftp-money").style.color = "red";
      return false;
  }

  if (isNaN(document.getElementById("trade-rightp-money").value)) {
      document.getElementById("trade-rightp-money").value = "Der Wert muss eine Zahl sein.";
      document.getElementById("trade-rightp-money").style.color = "red";
      return false;
  }

  if (isNaN(document.getElementById("trade-leftp-anleihen").value)) {
      document.getElementById("trade-leftp-anleihen").value = "Der Wert muss eine Zahl sein.";
      document.getElementById("trade-leftp-anleihen").style.color = "red";
      return false;
  }

  if (isNaN(document.getElementById("trade-rightp-anleihen").value)) {
      document.getElementById("trade-rightp-anleihen").value = "Der Wert muss eine Zahl sein.";
      document.getElementById("trade-rightp-anleihen").style.color = "red";
      return false;
  }

  if (isNaN(document.getElementById("trade-leftp-derivate").value)) {
      document.getElementById("trade-leftp-derivate").value = "Der Wert muss eine Zahl sein.";
      document.getElementById("trade-leftp-derivate").style.color = "red";
      return false;
  }

  if (isNaN(document.getElementById("trade-rightp-derivate").value)) {
      document.getElementById("trade-rightp-derivate").value = "Der Wert muss eine Zahl sein.";
      document.getElementById("trade-rightp-derivate").style.color = "red";
      return false;
  }

  readTrade();

  setTimeout(() => { finishProposeTrade();}, 100);

}

function tradeAltered() {
    $("#proposetradebutton").show();
    $("#accepttradebutton").hide();
}

function finishProposeTrade() {
    var money = tradeObj.money;
    var initiator = tradeObj.initiator;
    var recipient = tradeObj.recipient;
    var reversedTradeProperty = [];
    var anleihen = tradeObj.anleihen;
    var derivate = tradeObj.derivate;
    var assets = tradeObj.assets;
    var reversedAssets = [];

    if (recipient.index == 0) {
        recipient.anleihen = recipient.anleihen
        recipient.derivate = recipient.derivate
    }

    if (money > 0 && money > initiator.money) {
        document.getElementById("trade-leftp-money").value = initiator.name + " hat keine " + money + ".";
        document.getElementById("trade-leftp-money").style.color = "red";
        return false;
    } else if (!(recipient.name == "Bank") && money < 0 && -money > recipient.money) {
        document.getElementById("trade-rightp-money").value = recipient.name + " hat keine " + (-money) + ".";
        document.getElementById("trade-rightp-money").style.color = "red";
        return false;
    }

    if (anleihen > 0 && anleihen > initiator.anleihen) {
        document.getElementById("trade-leftp-anleihen").value = initiator.name + " hat keine Anleihen im Wert von " + anleihen + ".";
        document.getElementById("trade-leftp-anleihen").style.color = "red";
        return false;
    } else if (anleihen < 0 && -anleihen > recipient.anleihen) {
        document.getElementById("trade-rightp-anleihen").value = recipient.name + " hat keine Anleihen im Wert von " + (-anleihen) + ".";
        document.getElementById("trade-rightp-anleihen").style.color = "red";
        return false;
    }

    if (derivate > 0 && derivate > initiator.derivate) {
        document.getElementById("trade-leftp-derivate").value = initiator.name + " hat keine Derivate im Wert von " + derivate + ".";
        document.getElementById("trade-leftp-derivate").style.color = "red";
        return false;
    } else if (derivate < 0 && -derivate > recipient.derivate) {
        document.getElementById("trade-rightp-derivate").value = recipient.name + " hat keine Derivate im Wert von " + (-derivate) + ".";
        document.getElementById("trade-rightp-derivate").style.color = "red";
        return false;
    }

    for (var i = 0; i < 12; i++) {
        reversedTradeProperty[i] = -tradeObj.property[i];
    }

    for (i = 0; i < assets.length; i++) {
        reversedAssets[i] = -assets[i];
    }

    if (!confirm(initiator.name + ", bist du sicher, dass du dieses Angebot an " + recipient.name + " machen willst?")) {
        return false;
    }

    socket.emit('newTrade', recipient, initiator, -money, reversedTradeProperty, -anleihen, -derivate, reversedAssets);
    socket.emit('sendOffer');

    cancelTrade();
};

socket.on('receiveOffer', function(tradeObj) {
    initiator = tradeObj.initiator;
    recipient = tradeObj.recipient;

    showTradeMenu();
    setTimeout(() => { writeTrade(tradeObj); }, 200);
    
    $("#proposetradebutton").hide();
    $("#canceltradebutton").hide();
    $("#accepttradebutton").show();
    $("#rejecttradebutton").show();

    socket.emit('addAlert', recipient.name + " hat einen Handel mit " + initiator.name + " begonnen.");
    popup("<p>" + recipient.name + " hat dir, " + initiator.name + ", einen Tausch angeboten. Du kannst das Angebot annehmen, ablehnen oder verändern.</p>");
    
});

function cancelTrade() {
  //TODO
    $("#board").show();
    $("#control").show();
    $("#trade").hide();
    $("#credit").hide();

    $('#icon-bar a.active').removeClass('active');
    $("#logicon").addClass('active');
};

function acceptTrade() {
  if (isNaN(document.getElementById("trade-leftp-money").value)) {
      document.getElementById("trade-leftp-money").value = "Der Wert muss eine Zahl sein.";
      document.getElementById("trade-leftp-money").style.color = "red";
      return false;
  }

  if (isNaN(document.getElementById("trade-rightp-money").value)) {
      document.getElementById("trade-rightp-money").value = "Der Wert muss eine Zahl sein.";
      document.getElementById("trade-rightp-money").style.color = "red";
      return false;
  }

  var showAlerts = true;

  readTrade();

  setTimeout(() => { finishAcceptTrade(showAlerts);}, 100);
}

function finishAcceptTrade(showAlerts) {
  //TODO
  var money;
  var initiator;
  var recipient;

  money = tradeObj.money;
  anleihen = tradeObj.anleihen;
  derivate = tradeObj.derivate;
  initiator = tradeObj.initiator;
  recipient = tradeObj.recipient;
  assets = tradeObj.assets;

  // Ensure that some properties are selected.
  for (var i = 0; i < 12; i++) {
      isAPropertySelected |= tradeObj.property[i];
  }

  if (showAlerts && !confirm(initiator.name + ", bist du sicher, dass du diesen Tausch mit " + recipient.name + " machen willst?")) {
      return false;
  }

  // Exchange properties
  for (var i = 0; i < 12; i++) {

      if (tradeObj.property[i] === 1) {
          socket.emit('changeOwner', i, recipient.index);
          socket.emit('addAlert', recipient.name + " hat " + square[i].name + " von " + initiator.name + " erhalten.");
      } else if (tradeObj.property[i] === -1) {
          socket.emit('changeOwner', i, initiator.index);
          socket.emit('addAlert', initiator.name + " hat " + square[i].name + " von " + recipient.name + " erhalten.");
      }

  }

  if (tradeObj.assets.length == 3) {
      socket.emit('transferAssets', initiator.index, recipient.index, assets)
  }

  // Exchange money.
  if (money > 0) {
      socket.emit('pay', initiator, recipient, money);

      socket.emit('addAlert', recipient.name + " bekommt " + money + " von " + initiator.name + ".");
  } else if (money < 0) {
      socket.emit('pay', recipient, initiator, -money);

      socket.emit('addAlert', initiator.name + " bekommt " + (-money) + " von " + recipient.name + ".");
  }

  //stock exchange
  if (anleihen > 0) {
      socket.emit('buyAnleihen', initiator.index, recipient.index, anleihen);

      socket.emit('addAlert', recipient.name + " bekommt Anleihen im Wert von " + anleihen + " von " + initiator.name + ".");
  } else if (anleihen < 0) {
      socket.emit('buyAnleihen', recipient.index, initiator.index, -anleihen);

      socket.emit('addAlert', initiator.name + " bekommt Anleihen im Wert von " + (-anleihen) + " von " + recipient.name + ".");
  }

  if (derivate > 0) {
      socket.emit('buyDerivate', initiator.index, recipient.index, derivate);

      socket.emit('addAlert', recipient.name + " bekommt Derivate im Wert von " + derivate + " von " + initiator.name + ".");
  } else if (derivate < 0) {
      socket.emit('buyDerivate', recipient.index, initiator.index, -derivate);

      socket.emit('addAlert', initiator.name + " bekommt Derivate im Wert von " + (-derivate) + " von " + recipient.name + ".");
  }

  socket.emit('updateOwned');
  socket.emit('updateMoney');

  $("#board").show();
  $("#control").show();
  $("#trade").hide();
  $("#credit").hide();
};

var tableRowOnClick = function(e) {
  //TODO
  var checkboxElement = this.firstChild.firstChild;

  if (checkboxElement !== e.srcElement) {
      checkboxElement.checked = !checkboxElement.checked;
  }

  $("#proposetradebutton").show();
  $("#canceltradebutton").show();
  $("#accepttradebutton").hide();
  $("#rejecttradebutton").hide();
};

//square, player
function resetTrade(initiator, recipient, allowRecipientToBeChanged) {
  var currentSquare;
  var currentTableRow;
  var currentTableCell;
  var currentTableCellCheckbox;
  var nameSelect;
  var currentOption;
  var currentName;

  if (recipient.index == 0) {
      document.getElementById("description-derivate").innerHTML = "Derivate (Kurs: " + meineBank.derivateKurs + "):";
  } else {
      document.getElementById("description-derivate").innerHTML = "Derivate";
  }

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
          if (recipient.index == 0) continue;
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
      initiatorProperty.textContent = initiator.name + " hat keine Grundstücke zum Handeln.";
  }

  if (recipientSideTable.lastChild) {
      recipientProperty.appendChild(recipientSideTable);
  } else {
      recipientProperty.textContent = recipient.name + " hat keine Grundstücke zum Handeln.";
  }

  var initiatorAssets= document.getElementById("trade-leftp-assets");
  var recipientAssets = document.getElementById("trade-rightp-assets");

  // Empty elements.
  while (initiatorAssets.lastChild) {
      initiatorAssets.removeChild(initiatorAssets.lastChild);
  }

  while (recipientAssets.lastChild) {
      recipientAssets.removeChild(recipientAssets.lastChild);
  }

  var initiatorSideTable = document.createElement("table");
  var recipientSideTable = document.createElement("table");

  if (initiator.yacht > 0) {
      currentTableRow = initiatorSideTable.appendChild(document.createElement("tr"));
      currentTableRow.onclick = tableRowOnClick;

      currentTableCell = currentTableRow.appendChild(document.createElement("td"));
      currentTableCell.className = "propertycellcheckbox";
      currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
      currentTableCellCheckbox.type = "checkbox";
      currentTableCellCheckbox.id = "tradeleftcheckboxY";
      currentTableCellCheckbox.title = "Check this box to include Yacht in the trade.";

      currentTableCell = currentTableRow.appendChild(document.createElement("td"));
      currentTableCell.className = "assetcellcolor";
      currentTableCell.innerHTML = '<i class="fa-solid fa-sailboat"></i>';

      currentTableCell = currentTableRow.appendChild(document.createElement("td"));
      currentTableCell.className = "propertycellname";
      currentTableCell.textContent = "Yacht";
  }
  if (recipient.yacht > 0) {
      currentTableRow = recipientSideTable.appendChild(document.createElement("tr"));
      currentTableRow.onclick = tableRowOnClick;

      currentTableCell = currentTableRow.appendChild(document.createElement("td"));
      currentTableCell.className = "propertycellcheckbox";
      currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
      currentTableCellCheckbox.type = "checkbox";
      currentTableCellCheckbox.id = "traderightcheckboxY";
      currentTableCellCheckbox.title = "Check this box to include Yacht in the trade.";

      currentTableCell = currentTableRow.appendChild(document.createElement("td"));
      currentTableCell.className = "assetcellcolor";
      currentTableCell.innerHTML = '<i class="fa-solid fa-sailboat"></i>';

      currentTableCell = currentTableRow.appendChild(document.createElement("td"));
      currentTableCell.className = "propertycellname";
      currentTableCell.textContent = "Yacht";
  }

  if (initiator.auto > 0) {
      currentTableRow = initiatorSideTable.appendChild(document.createElement("tr"));
      currentTableRow.onclick = tableRowOnClick;

      currentTableCell = currentTableRow.appendChild(document.createElement("td"));
      currentTableCell.className = "propertycellcheckbox";
      currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
      currentTableCellCheckbox.type = "checkbox";
      currentTableCellCheckbox.id = "tradeleftcheckboxA";
      currentTableCellCheckbox.title = "Check this box to include Auto in the trade.";

      currentTableCell = currentTableRow.appendChild(document.createElement("td"));
      currentTableCell.className = "assetcellcolor";
      currentTableCell.innerHTML = '<i class="fa-solid fa-car"></i>';

      currentTableCell = currentTableRow.appendChild(document.createElement("td"));
      currentTableCell.className = "propertycellname";
      currentTableCell.textContent = "Auto";
  }
  if (recipient.auto > 0) {
      currentTableRow = recipientSideTable.appendChild(document.createElement("tr"));
      currentTableRow.onclick = tableRowOnClick;

      currentTableCell = currentTableRow.appendChild(document.createElement("td"));
      currentTableCell.className = "propertycellcheckbox";
      currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
      currentTableCellCheckbox.type = "checkbox";
      currentTableCellCheckbox.id = "traderightcheckboxA";
      currentTableCellCheckbox.title = "Check this box to include Auto in the trade.";

      currentTableCell = currentTableRow.appendChild(document.createElement("td"));
      currentTableCell.className = "assetcellcolor";
      currentTableCell.innerHTML = '<i class="fa-solid fa-car"></i>';

      currentTableCell = currentTableRow.appendChild(document.createElement("td"));
      currentTableCell.className = "propertycellname";
      currentTableCell.textContent = "Auto";
  }

  if (initiator.motorrad > 0) {
      currentTableRow = initiatorSideTable.appendChild(document.createElement("tr"));
      currentTableRow.onclick = tableRowOnClick;

      currentTableCell = currentTableRow.appendChild(document.createElement("td"));
      currentTableCell.className = "propertycellcheckbox";
      currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
      currentTableCellCheckbox.type = "checkbox";
      currentTableCellCheckbox.id = "tradeleftcheckboxM";
      currentTableCellCheckbox.title = "Check this box to include Motorrad in the trade.";

      currentTableCell = currentTableRow.appendChild(document.createElement("td"));
      currentTableCell.className = "assetcellcolor";
      currentTableCell.innerHTML = '<i class="fa-solid fa-motorcycle"></i>';

      currentTableCell = currentTableRow.appendChild(document.createElement("td"));
      currentTableCell.className = "propertycellname";
      currentTableCell.textContent = "Motorrad";
  }
  if (recipient.motorrad > 0) {
      currentTableRow = recipientSideTable.appendChild(document.createElement("tr"));
      currentTableRow.onclick = tableRowOnClick;

      currentTableCell = currentTableRow.appendChild(document.createElement("td"));
      currentTableCell.className = "propertycellcheckbox";
      currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
      currentTableCellCheckbox.type = "checkbox";
      currentTableCellCheckbox.id = "traderightcheckboxM";
      currentTableCellCheckbox.title = "Check this box to include Motorrad in the trade.";

      currentTableCell = currentTableRow.appendChild(document.createElement("td"));
      currentTableCell.className = "assetcellcolor";
      currentTableCell.innerHTML = '<i class="fa-solid fa-motorcycle"></i>';

      /*currentTableCell = currentTableRow.appendChild(document.createElement("td"));
      currentTableCell.className = "propertycellcolor";
      currentTableCell.style.backgroundColor = currentSquare.color;*/

      currentTableCell = currentTableRow.appendChild(document.createElement("td"));
      currentTableCell.className = "propertycellname";
      currentTableCell.textContent = "Motorrad";
  }

  if (initiatorSideTable.lastChild) {
      initiatorAssets.appendChild(initiatorSideTable);
  } else {
      initiatorAssets.textContent = initiator.name + " hat keine Wertgegenstände zum Handeln.";
  }

  if (recipientSideTable.lastChild) {
      recipientAssets.appendChild(recipientSideTable);
  } else {
      recipientAssets.textContent = recipient.name + " hat keine Wertgegenstände zum Handeln.";
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

      currentOption = nameSelect.appendChild(document.createElement("option"));
      currentOption.value = 0 + "";
      currentOption.style.color = meineBank.color;
      currentOption.textContent = meineBank.name;

      if (0 === recipient.index) {
          currentOption.selected = "selected";
      }

      nameSelect.onchange = function() {
          resetTrade(currentInitiator, player[parseInt(this.value, 10)], true);
      };

      nameSelect.title = "Wähle einen Mitspieler zum Handeln aus.";
  } else {
      currentName.textContent = recipient.name;
  }

  document.getElementById("trade-leftp-money").value = "0";
  document.getElementById("trade-rightp-money").value = "0";

  document.getElementById("trade-leftp-anleihen").value = "0";
  document.getElementById("trade-rightp-anleihen").value = "0";

  document.getElementById("trade-leftp-derivate").value = "0";
  document.getElementById("trade-rightp-derivate").value = "0";
  
};

function finishTradeMenu() {
    
  var initiator = player[playerId];
  var recipient = playerId === 1 ? player[2] : player[1];

  currentInitiator = initiator;
  currentRecipient = recipient;

  resetTrade(initiator, recipient, true);
}

const TradeCell = ({ side, asset, title }) => (
    <td className="trade-cell">
      {asset}: &nbsp;
      <input id={`trade-${side}p-${asset}`} value="0" type="number" title={title} onChange={tradeAltered()} />
    </td>
  );

const Trade = () => {
    const assets = [
        { asset: 'money', title: 'Wie viel Geld möchtest du tauschen?' },
        { asset: 'derivate', title: 'Wie viele Derivate möchtest du tauschen?' },
        { asset: 'anleihen', title: 'Wie viele Anleihen möchtest du tauschen?' },
    ];

    return (
    <div id="trade">
      <table style={{borderSpacing: "3px"}}>
        <tbody>
        <tr>
          <td className="trade-cell">
            <div id="trade-leftp-name"></div>
          </td>
          <td className="trade-cell">
            <div id="trade-rightp-name"></div>
          </td>
        </tr>
        {assets.map(({ asset, title }) => (
            <tr key={asset}>
              <TradeCell side="left" asset={asset} title={title} />
              <TradeCell side="right" asset={asset} title={title} />
            </tr>
        ))}
        <tr>
          <td id="trade-leftp-property" className="trade-cell"></td>
          <td id="trade-rightp-property" className="trade-cell"></td>
        </tr>
        <tr>
          <td id="trade-leftp-assets" className="trade-cell"></td>
          <td id="trade-rightp-assets" className="trade-cell"></td>
        </tr>
        <tr>
          <td colspan="2" className="trade-cell">
            <input type="button" id="proposetradebutton" value="Tausch anbieten" onclick="proposeTrade();" title="Handel mit Geld, Grundstücken, Anleihen und Derivaten anbieten." />
            <input type="button" id="canceltradebutton" value="Abbrechen" onclick="cancelTrade();" title="Tausch abbrechen." />
            <input type="button" id="accepttradebutton" value="Tausch annehmen" onclick="acceptTrade();" title="Nehme den angebotenen Tausch an." />
            <input type="button" id="rejecttradebutton" value="Tausch ablehnen" onclick="cancelTrade();" title="Lehne den angebotenen Tausch ab." />
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    );
};

export default Trade;