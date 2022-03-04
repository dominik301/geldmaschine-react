var socket = io();
var typing = false;

var playerId;
var pcount;

var start = document.getElementById('startbutton');

start.onclick = function(e){
    //prevent the form from refreshing the page
    e.preventDefault();

    socket.emit("windowload");
    
    var isKapitalismus = true; //document.getElementById('capitalism').value == "Kapitalismus";
    var nieten = document.getElementById("nieten").value;
    var pNo = document.getElementById("spieler").value;
    socket.emit('setup', isKapitalismus, pNo, nieten);
}

var kreditaufnehmen = document.getElementById('kreditaufnehmenbutton');
var kredittilgen = document.getElementById('kredittilgenbutton');
var kredit = document.getElementById('credit-leftp-money');

kreditaufnehmen.onclick = function(e){
    //prevent the form from refreshing the page
    e.preventDefault();

    if (isNaN(document.getElementById("credit-leftp-money").value)) {
        document.getElementById("credit-leftp-money").value = "Bitte eine Zahl eingeben.";
        document.getElementById("credit-leftp-money").style.color = "red";
        return false;
    }

    var money = kredit.value;

    if (!confirm(document.getElementById("player" + playerId + "name").value + ", möchtest Du wirklich einen Kredit aufnehmen?")) {
        return false;
    }
    
    socket.emit('kreditaufnehmen', money);
    kredit.value = "0";
}

kredittilgen.onclick = function(e){
    //prevent the form from refreshing the page
    e.preventDefault();

    if (isNaN(document.getElementById("credit-leftp-money").value)) {
        document.getElementById("credit-leftp-money").value = "Bitte eine Zahl eingeben.";
        document.getElementById("credit-leftp-money").style.color = "red";
        return false;
    }

    if (!confirm(document.getElementById("player" + playerId + "name").value + ", möchtest Du wirklich deinen Kredit tilgen?")) {
        return false;
    }
    
    socket.emit('kredittilgen', kredit.value);
    kredit.value = "0";
}

function cancelkredit() {
    $("#board").show();
    $("#control").show();
    $("#credit").hide();

    $("#gamemenu").show();
    $("#returnToLog").hide();
}

var next = document.getElementById('nextbutton');
var resign = document.getElementById('resignbutton');
var creditB = document.getElementById('creditbutton');
var round = 0;

next.onclick = function(e){
    //prevent the form from refreshing the page
    e.preventDefault();
    
    socket.emit('next');

    if (next.value == "Spielzug beenden") {
        $("#nextbutton").hide();
        allow2houses = false;
        xValues.push(round);
        geldMengen.push(meineBank.geldMenge)
        bankZinsen.push(meineBank.zinsenLotto)
        round++;
        myChart.update();
    }
}

function buy() {
    socket.emit('buy');
}

resign.onclick = function(e){
    //prevent the form from refreshing the page
    e.preventDefault();

    socket.emit('sozialhilfe');
    //popup("<p>Möchtest du wirklich aufgeben?</p>", doResign, "Ja/Nein");
}

creditB.onclick = function(e){
    e.preventDefault();

    showCreditMenu();
}

function doResign() {
    socket.emit('resign');
}

var buyhouse = document.getElementById('buyhousebutton');
var mortgage = document.getElementById('mortgagebutton');
var sellhouse = document.getElementById('sellhousebutton');

buyhouse.onclick = function(e){
    //prevent the form from refreshing the page
    e.preventDefault();

    var checkedProperty = getCheckedProperty();            
    
    socket.emit('buyhouse', checkedProperty);
}

mortgage.onclick = function(e){
    //prevent the form from refreshing the page
    e.preventDefault();

    var checkedProperty = getCheckedProperty();

    socket.emit('mortgage', checkedProperty);           
    
}

sellhouse.onclick = function(e){
    //prevent the form from refreshing the page
    e.preventDefault();
    
    socket.emit('sellhouse', getCheckedProperty());
}

var currentInitiator;
var currentRecipient;

var tradeObj;

socket.on('tradeObj', function(data) {
    tradeObj = data;
});

var allow2houses = false;

socket.on('buyhouse2', function(isAllowed) {
    allow2houses = isAllowed;
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

document.getElementById("trade-leftp-money").onchange = tradeAltered;
document.getElementById("trade-rightp-money").onchange = tradeAltered;
document.getElementById("trade-leftp-anleihen").onchange = tradeAltered;
document.getElementById("trade-rightp-anleihen").onchange = tradeAltered;
document.getElementById("trade-leftp-derivate").onchange = tradeAltered;
document.getElementById("trade-rightp-derivate").onchange = tradeAltered;
document.getElementById("trade-leftp-property").onchange = tradeAltered;
document.getElementById("trade-rightp-property").onchange = tradeAltered;
document.getElementById("trade-leftp-assets").onchange = tradeAltered;
document.getElementById("trade-rightp-assets").onchange = tradeAltered;

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
        recipient.anleihen = recipient.anleihenBank
        recipient.derivate = recipient.derivateBank
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

    var isAPropertySelected = 0;

    // Ensure that some properties are selected.
    for (var i = 0; i < 12; i++) {
        reversedTradeProperty[i] = -tradeObj.property[i];
        isAPropertySelected |= tradeObj.property[i];
    }

    for (i = 0; i < assets.length; i++) {
        reversedAssets[i] = -assets[i];
    }

    /*if (isAPropertySelected === 0) {
        popup("<p>One or more properties must be selected in order to trade.</p>");

        return false;
    }*/

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
    $("#board").show();
    $("#control").show();
    $("#trade").hide();
    $("#credit").hide();

    $("#gamemenu").show();
    $("#returnToLog").hide();
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

    /*if (tradeObj) {
        showAlerts = false;
    } else {
        readTrade();
    }*/
    readTrade();

    setTimeout(() => { finishAcceptTrade(showAlerts);}, 100);
}

function finishAcceptTrade(showAlerts) {
    var money;
    var initiator;
    var recipient;

    money = tradeObj.money;
    anleihen = tradeObj.anleihen;
    derivate = tradeObj.derivate;
    initiator = tradeObj.initiator;
    recipient = tradeObj.recipient;
    assets = tradeObj.assets;

    /*if (money > 0 && money > initiator.money) {
        document.getElementById("trade-leftp-money").value = initiator.name + " does not have $" + money + ".";
        document.getElementById("trade-leftp-money").style.color = "red";
        return false;
    } else if (!(recipient.name == "bank") && money < 0 && -money > recipient.money) {
        document.getElementById("trade-rightp-money").value = recipient.name + " does not have $" + (-money) + ".";
        document.getElementById("trade-rightp-money").style.color = "red";
        return false;
    }*/

    var isAPropertySelected = 0;

    // Ensure that some properties are selected.
    for (var i = 0; i < 12; i++) {
        isAPropertySelected |= tradeObj.property[i];
    }

    /*if (isAPropertySelected === 0) {
        popup("<p>One or more properties must be selected in order to trade.</p>");

        return false;
    }*/

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

var square;
socket.on('updateSquare', function(msquare) {
    square = msquare;
});

var player;
var meineBank;
socket.on('updatePlayer', function(mplayer, mbank) {
    player = mplayer;
    meineBank = mbank;
});

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
        currentTableCell.innerHTML = "<img src='https://upload.wikimedia.org/wikipedia/commons/5/53/Segeln_2.svg' title='Yacht' class='asset' />";

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
        currentTableCell.innerHTML = "<img src='https://upload.wikimedia.org/wikipedia/commons/5/53/Segeln_2.svg' title='Yacht' class='asset' />";

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
        currentTableCell.innerHTML = "<img src='https://upload.wikimedia.org/wikipedia/commons/b/b2/CH-Zusatztafel-Leichte_Motorwagen.svg' title='Auto' class='asset' />";

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
        currentTableCell.innerHTML = "<img src='https://upload.wikimedia.org/wikipedia/commons/b/b2/CH-Zusatztafel-Leichte_Motorwagen.svg' title='Auto' class='asset' />";

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
        currentTableCell.innerHTML = "<img src='https://upload.wikimedia.org/wikipedia/commons/0/06/Motorrad_aus_Zusatzzeichen_1046-12.svg' title='Motorrad' class='asset' />";

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
        currentTableCell.innerHTML = "<img src='https://upload.wikimedia.org/wikipedia/commons/0/06/Motorrad_aus_Zusatzzeichen_1046-12.svg' title='Motorrad' class='asset' />";

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

socket.on('setPlayerId',function(data){
            
    playerId = data;

    $("#name" + playerId + "button").on("click", function() {
        var name = document.getElementById("player" + playerId + "name").value;
        socket.emit('setName', name);
    });

    if (playerId != 1) {
        $("#zinsen").hide();
        $("#verteilung").hide();
        $("#startbutton").hide();
    }
            
});

socket.on('playerno',function(pnumber){
    pcount = pnumber;
    playernumber_onchange();
});

socket.on('addAlert', function(alertText) {
    $alert = $("#alert");

    $(document.createElement("div")).text(alertText).appendTo($alert);

    // Animate scrolling down alert element.
    $alert.stop().animate({"scrollTop": $alert.prop("scrollHeight")}, 1000);
})

function addAlert(alertText) {
    $alert = $("#alert");

    $(document.createElement("div")).text(alertText).appendTo($alert);

    // Animate scrolling down alert element.
    $alert.stop().animate({"scrollTop": $alert.prop("scrollHeight")}, 1000);
}

socket.on('eliminatePlayer', function(HTML, action) {
    document.getElementById("popuptext").innerHTML = HTML;
    document.getElementById("popup").style.width = "300px";
    document.getElementById("popup").style.top = "0px";
    document.getElementById("popup").style.left = "0px";

    option = action;

    option = option ? option.toLowerCase() : "";

    if (typeof action !== "function") {
        action = null;
    }

    
    $("#popuptext").append("<div><input type='button' value='OK' id='popupclose' /></div>");
    $("#popupclose").focus();

    $("#popupclose").on("click", function() {
        $("#popupwrap").hide();
        $("#popupbackground").fadeOut(400);
    }).on("click", eliminatePlayer);

    

    // Show using animation.
    $("#popupbackground").fadeIn(400, function() {
        $("#popupwrap").show();
    });
});

function eliminatePlayer() {
    socket.emit('eliminate');
}

socket.on('playerNames', function(names) {
    for (var i in names) {
        document.getElementById("player" + i + "name").innerHTML = names[i];
    }
});

socket.on('updateMoney', function(_player, turn, _meineBank, meinStaat, _pcount) {
    player = _player;
    meineBank = _meineBank;
    var p = player[turn];
    pcount = _pcount;
    document.getElementById("pname").innerHTML = p.name;
    document.getElementById("pmoney").innerHTML = "$" + p.money;
    $(".money-bar-row").hide();

    for (var i = 1; i <= pcount; i++) {
        p_i = player[i];

        $("#moneybarrow" + i).show();
        document.getElementById("p" + i + "moneybar").style.border = "2px solid " + p_i.color;
        document.getElementById("p" + i + "money").innerHTML = p_i.money > 0 ? p_i.money : 0;
        document.getElementById("p" + i + "moneyname").innerHTML = p_i.name;
        document.getElementById("p" + i + "credit").innerHTML = -p_i.sumKredit;
        document.getElementById("p" + i + "dispocredit").innerHTML = p_i.money > 0 ? 0 : p_i.money;
        document.getElementById("p" + i + "avcredit").innerHTML = p_i.verfuegbareHypothek;
        document.getElementById("p" + i + "anleihen").innerHTML = p_i.anleihen;
        document.getElementById("p" + i + "derivate").innerHTML = p_i.derivate;
    }

    //var bank = player[0];

    $("#moneybarrow7").show();
    document.getElementById("p7moneybar").style.border = "2px solid " + "black";
    document.getElementById("p7money").innerHTML = meineBank.geldMenge;
    document.getElementById("p7credit").innerHTML = meineBank.zinsenLotto;
    document.getElementById("p7anleihen").innerHTML = meineBank.anleihenBank;
    document.getElementById("p7derivate").innerHTML = meineBank.derivateBank;

    $("#moneybarrow8").show();
    document.getElementById("p8moneybar").style.border = "2px solid " + "black";
    document.getElementById("p8money").innerHTML = meinStaat.staatsSchuld;
    document.getElementById("p8credit").innerHTML = meinStaat.steuer;

    if (document.getElementById("landed").innerHTML === "") {
        $("#landed").hide();
    }

    document.getElementById("quickstats").style.borderColor = p.color;
    if (turn == playerId) {
        if (p.money < 0) {
            // document.getElementById("nextbutton").disabled = true;
            //if (p.verfuegbareHypothek < p.sumKredit - p.money) $("#resignbutton").show();
            $("#resignbutton").hide();
            $("#creditbutton").show();
            $("#nextbutton").show();
        } else {
            // document.getElementById("nextbutton").disabled = false;
            $("#resignbutton").hide();
            $("#creditbutton").hide();
            $("#nextbutton").show();
        }
    }
});

socket.on('updateDice', function(die0){

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

        element0.src = "./client/images/Die_" + die0 + ".png";
        element0.alt = die0;
    } else {
        document.getElementById("die0").textContent = die0;

        document.getElementById("die0").title = "Die";
    }
});

socket.on('updateOwned', function(player, square) {
    var checkedproperty = getCheckedProperty();
    var p = player[playerId];
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
            $("#cell" + i + "house").hide();
            $("#cell" + i + "house2").hide();
        } else if (sq.groupNumber && sq.owner > 0) {
            var currentCellOwner = document.getElementById("cell" + i + "owner");

            currentCellOwner.style.display = "block";
            currentCellOwner.style.backgroundColor = player[sq.owner].color;
            currentCellOwner.title = player[sq.owner].name;

            if (sq.house) {
                var currentCellHouse = document.getElementById("cell" + i + "house");
                currentCellHouse.style.display = "block";

                if (sq.house == 2) {
                    var currentCellHouse2 = document.getElementById("cell" + i + "house2");
                    currentCellHouse2.style.display = "block";
                }
            }     
            else {
                $("#cell" + i + "house").hide();
                $("#cell" + i + "house2").hide();
            }       
            
        }
    }

    for (var i = 0; i < 12; i++) {
        sq = square[i];
        if (sq.owner == playerId) {

            mortgagetext = "";
            if (sq.mortgage) {
                mortgagetext = "title='Hypothek aufgenommen' style='color: grey;'";
            }

            housetext = "";
            if (sq.house >= 1 && sq.house <= 2) {
                for (var x = 1; x <= sq.house; x++) {
                    housetext += "<img src='./client/images/house.png' alt='' title='Haus' class='house' />";
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
        HTML = p.name + ", du besitzt keine Grundstücke.";
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

        socket.emit('updateOption');
    });
});

socket.on('updateOption', function(square){
    var checkedproperty = getCheckedProperty();
    var sq = square[checkedproperty];

    $("#option").show();

    if (checkedproperty < 0 || checkedproperty >= 12) {
        $("#buyhousebutton").hide();
        $("#sellhousebutton").hide();
        $("#mortgagebutton").hide();

        return;
    }

    $("#buildings").hide();

    buyhousebutton = document.getElementById("buyhousebutton");
    sellhousebutton = document.getElementById("sellhousebutton");

    $("#mortgagebutton").show();
    document.getElementById("mortgagebutton").disabled = false;

    if (sq.mortgage) {
        document.getElementById("mortgagebutton").value = "Hypothek zurückzahlen ($" + sq.price + ")";
        document.getElementById("mortgagebutton").title = "Hypothek auf " + sq.name + " für " + sq.price + " zurückzahlen.";
        $("#buyhousebutton").hide();
        $("#sellhousebutton").hide();

        allGroupUnmortgaged = false;
    } else {
        document.getElementById("mortgagebutton").value = "Hypothek ($" + sq.price + ")";
        document.getElementById("mortgagebutton").title = "Hypothek auf " + sq.name + " für " + sq.price + " aufnehmen.";
    }

        
    $("#buyhousebutton").show();
    $("#sellhousebutton").show();
    buyhousebutton.disabled = false;
    sellhousebutton.disabled = false;

    if (sq.house == 0) {
        $("#sellhousebutton").hide();
        buyhousebutton.value = "Haus kaufen (" + sq.houseprice + ")";
        buyhousebutton.title = "Kaufe ein Haus für " + sq.houseprice;
    }
    

    if (sq.house >= 1) {
        if (!allow2houses || sq.house == 2) {
            $("#buyhousebutton").hide();
        } else {
            buyhousebutton.value = "Haus kaufen (" + sq.houseprice + ")";
            buyhousebutton.title = "Kaufe ein Haus für " + sq.houseprice;
        }
        sellhousebutton.value = "Haus verkaufen (" + (sq.houseprice) + ")";
        sellhousebutton.title = "Verkaufe eine Haus für " + (sq.houseprice);

        $("#mortgagebutton").show();
        document.getElementById("mortgagebutton").disabled = false;

        if (sq.mortgage) {
            document.getElementById("mortgagebutton").value = "Hypothek zurückzahlen ($" + sq.price + ")";
            document.getElementById("mortgagebutton").title = "Hypothek auf " + sq.name + " für " + sq.price + " zurückzahlen.";
            $("#buyhousebutton").hide();
            $("#sellhousebutton").hide();

            allGroupUnmortgaged = false;
        } else {
            document.getElementById("mortgagebutton").value = "Hypothek ($" + sq.price + ")";
            document.getElementById("mortgagebutton").title = "Hypothek auf " + sq.name + " für " + sq.price + " aufnehmen.";
        }
    }
    
});


socket.on('showdeed', function(sq) {
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
        //document.getElementById("deed-mortgage").textContent = (sq.price);
        document.getElementById("deed-houseprice").textContent = sq.houseprice;
    }
});

socket.on('showstats', function(HTML) {
    document.getElementById("statstext").innerHTML = HTML;
    // Show using animation.
    $("#statsbackground").fadeIn(400, function() {
        $("#statswrap").show();
    });
});

socket.on('changeButton', function(button, value, title){
    document.getElementById(button).value = value;
    document.getElementById(button).title = title;
});

socket.on('focusbutton', function(button) {
    document.getElementById(button).focus();
});

socket.on('roll', function() {
    $("#option").hide();
    $("#buy").show();
    $("#manage").hide();
    $("#audio").hide();

    document.getElementById("nextbutton").focus();
});

socket.on('setHTML', function(element, text) {
    document.getElementById(element).innerHTML = text;
});

socket.on('show', function(element, isShow) {
    if (isShow) {
        $(element).show();
    } else {
        $(element).hide();
    }
    
});



var pcount;

function playernumber_onchange() {
    //pcount = parseInt(document.getElementById("playernumber").value, 10);

    $(".player-input").hide();

    for (var i = 1; i <= pcount; i++) {
        $("#player" + i + "input").show();
    }
    switch(pcount) {
        case 6:
            $("#spieler5").hide();
            document.getElementById("spieler5").selected = true;
        case 5:
            $("#spieler4").hide();
            document.getElementById("spieler4").selected = true;
        case 4:
            $("#spieler3").hide();
            document.getElementById("spieler3").selected = true;
    }
    capitalism_onchange()

    if (playerId == 1 && pcount < 7) {
        $("#startbutton").show();
    } else {
        $("#startbutton").hide();
    }
}

function capitalism_onchange() {
    /*if (document.getElementById("capitalism").value != "Kapitalismus") {
        $("#nietenfield").hide()
        return;
    }*/

    $("#nietenfield").show()
    $("#spielerfield").show()
    
    //pcount = parseInt(document.getElementById("playernumber").value, 10);

    $("#nieten0").hide();
    $("#nieten1").hide();
    $("#nieten2").hide();
    $("#nieten4").hide();
    $("#nieten7").hide();
    $("#nieten8").hide();
    $("#nieten10").hide();

    var anzahlSpieler = document.getElementById("spieler").value;
    switch (parseInt(anzahlSpieler)) {
        case 3:
            $("#nieten0").show();
            document.getElementById("nieten0").selected = true;
            $("#nieten2").show();
            $("#nieten4").show();
            break;
        case 4:
            $("#nieten1").show();
            document.getElementById("nieten1").selected = true;
            $("#nieten4").show();
            $("#nieten7").show();
            break;
        case 5:
            $("#nieten0").show();
            document.getElementById("nieten0").selected = true;
            $("#nieten4").show();
            $("#nieten8").show();
            break;
        case 6:
            $("#nieten2").show();
            document.getElementById("nieten2").selected = true;
            $("#nieten7").show();
            break;
        /*case 6:
            $("#nieten4").show();
            document.getElementById("nieten4").selected = true;
            $("#nieten10").show();
            break;*/
    }
}

function getCheckedProperty() {
    for (var i = 0; i < 12; i++) {
        if (document.getElementById("propertycheckbox" + i) && document.getElementById("propertycheckbox" + i).checked) {
            return i;
        }
    }
    return -1; // No property is checked.
}

window.onload = function() {

    //$("#playernumber").on("change", playernumber_onchange);
    playernumber_onchange();

    $("#spieler").on("change", capitalism_onchange);

    //$("#capitalism").on("change", capitalism_onchange);
    capitalism_onchange();

    $("#noscript").hide();
    $("#setup, #noF5").show();
    $("credit").hide();

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
            if (e.clientY + 20 > window.innerHeight - 404) {
                document.getElementById("deed").style.top = (window.innerHeight - 404) + "px";
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

    
    $("#statsclose, #statsbackground").on("click", function() {
        $("#statswrap").hide();
        $("#statsbackground").fadeOut(400);
    });

    setName();

};


function openImmobilien() {
    $("#manage").show();
    $("#buy").hide();
    $("#audio").hide();
}

function openLog() {
    $("#buy").show();
    $("#manage").hide();
    $("#audio").hide();
    cancelkredit();
    cancelTrade();

    // Scroll alerts to bottom.
    $("#alert").scrollTop($("#alert").prop("scrollHeight"));
}

function openAudioMenu() {
    $("#audio").show();
    $("#buy").hide()
    $("#manage").hide();
}

function changeZinssatz() {
    socket.emit("zinssatz", parseInt(document.getElementById("zinssatzInput").value))
}

socket.on('setupsquares', function(square) {
    setupSquares(square);
});

function setupSquares(square) {

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

        currentCellColor = currentCellAnchor.appendChild(document.createElement("div"));
        currentCellColor.id = "cell" + i + "color";
        currentCellColor.className = "cell-color";
        currentCellColor.style.backgroundColor = s.color;

        currentCellPositionHolder = currentCellAnchor.appendChild(document.createElement("div"));
        currentCellPositionHolder.id = "cell" + i + "positionholder";
        currentCellPositionHolder.className = "cell-position-holder";
        currentCellPositionHolder.enlargeId = "enlarge" + i;

        currentCellName = currentCellAnchor.appendChild(document.createElement("div"));
        currentCellName.id = "cell" + i + "name";
        currentCellName.className = "cell-name";
        currentCellName.textContent = s.name == "Ereignisfeld" ? "" : s.name;

        currentCellPrice = currentCellAnchor.appendChild(document.createElement("div"));
        currentCellPrice.id = "cell" + i + "price";
        currentCellPrice.className = "cell-price";
        currentCellPrice.textContent = s.pricetext;

        currentCellHouse = currentCellAnchor.appendChild(document.createElement("div"));
        currentCellHouse.id = "cell" + i + "house";
        currentCellHouse.className = "cell-house";

        currentCellHouse2 = currentCellAnchor.appendChild(document.createElement("div"));
        currentCellHouse2.id = "cell" + i + "house2";
        currentCellHouse2.className = "cell-house2";

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
    document.getElementById("enlarge0token").innerHTML += '<img src="./client/images/arrow_icon.png" height="40" width="136" alt="" />';
    document.getElementById("enlarge6token").innerHTML += '<img src="./client/images/tax_icon.png" height="60" width="70" alt="" style="position: relative; top: -20px;" />';
}

function showCreditMenu() {
    $("#board").hide();
    $("#control").hide();
    //$("#trade").hide();
    $("#credit").show();
    $("#kreditaufnehmenbutton").show();
    $("#kredittilgenbutton").show();

    document.getElementById("credit-leftp-name").textContent = document.getElementById("p" + playerId + "moneyname").innerHTML;
    document.getElementById("credit-leftp-money").value = "0";
}

function showTradeMenu() {
    $("#board").hide();
    $("#control").hide();
    $("#trade").show();
    //$("#credit").show();
    $("#proposetradebutton").show();
    $("#canceltradebutton").show();
    $("#accepttradebutton").hide();
    $("#rejecttradebutton").hide();

    socket.emit('updateSquare');
    socket.emit('updatePlayer');
    setTimeout(() => { finishTradeMenu();}, 200);
};

function finishTradeMenu() {
    
    var initiator = player[playerId];
    var recipient = playerId === 1 ? player[2] : player[1];

    currentInitiator = initiator;
    currentRecipient = recipient;

    resetTrade(initiator, recipient, true);
}

function showStats() {
    socket.emit('showstats');
}

socket.on('popup', function(HTML, option, mortgage=false) {
    if (mortgage) {
        popup(HTML, doMortgage, option);
    } else {
        popup(HTML, option);
    }
})

function doMortgage() {
    socket.emit("doMortgage", getCheckedProperty());
}

socket.on('updatePosition', function(square, turn, player){
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
                if (left == 120) {
                    left = 0;
                    top = 24;
                } else
                    left += 24;
            }
        }

        for (var y = 1; y < turn; y++) {

            if (player[y].position == x) {
                document.getElementById("cell" + x + "positionholder").innerHTML += "<div class='cell-position' title='" + player[y].name + "' style='background-color: " + player[y].color + "; left: " + left + "px; top: " + top + "px;'></div>";
                if (left == 120) {
                    left = 0;
                    top = 24;
                } else
                    left += 24;
            }
        }
    }

    var p = player[turn];

    document.getElementById("cell" + p.position).style.border = "1px solid " + p.color;	

});

function setName() {
    setPopuptext("<p>Gib deinen Namen ein</p>");

    let popupText = "<div><input type=\"text\" id=\"playername\" title=\"SpielerIn Name\" maxlength=\"16\" /> <input type=\"button\" value=\"OK\" id=\"namebutton\"/></div>";
    document.getElementById("popuptext").innerHTML += popupText;

    $("#namebutton").on("click", function() {
        $("#popupwrap").hide();
        $("#popupbackground").fadeOut(400);

        let name = document.getElementById("playername").value;
        socket.emit('setName', name);

    });

    // Show using animation.
    $("#popupbackground").fadeIn(400, function() {
        $("#popupwrap").show();
    });
}

function setZinssatz() {
    setPopuptext("<p>Zinssatz ändern</p>");

    let popupText = "<div><input type=\"text\" id=\"zinssatzInput\" title=\"Zinssatz\" maxlength=\"3\" value=\"5\" size=\"3\"/> % <input type=\"button\" value=\"Ändern\" id=\"zinsbutton\"/></div>";
    document.getElementById("popuptext").innerHTML += popupText;

    $("#zinsbutton").on("click", function() {
        $("#popupwrap").hide();
        $("#popupbackground").fadeOut(400);

        socket.emit("zinssatz", parseInt(document.getElementById("zinssatzInput").value))

    });

    // Show using animation.
    $("#popupbackground").fadeIn(400, function() {
        $("#popupwrap").show();
    });
}

function setPopuptext(HTML) {
    document.getElementById("popuptext").innerHTML = HTML;
    document.getElementById("popup").style.width = "300px";
    document.getElementById("popup").style.top = "0px";
    document.getElementById("popup").style.left = "0px";
}

function popup(HTML, action, option) {
    setPopuptext(HTML);

    if (!option && typeof action === "string") {
        option = action;
    }

    option = option ? option.toLowerCase() : "";

    if (typeof action !== "function") {
        action = null;
    }

    // Yes/No
    if (option === "ja/nein") {
        document.getElementById("popuptext").innerHTML += "<div><input type=\"button\" value=\"Ja\" id=\"popupyes\" /><input type=\"button\" value=\"Nein\" id=\"popupno\" /></div>";

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

function hidedeed() {
    $("#deed").hide();
}

function showdeed(property) {
    socket.emit('showdeed', property)
}

function menuitem_onmouseover(element) {
    element.className = "menuitem menuitem_hover";
    return;
}

function menuitem_onmouseout(element) {
    element.className = "menuitem";
    return;
}

var auctionQueue = [];
var highestbidder;
var highestbid;
var currentbidder = 1;
var auctionproperty;

socket.on("chooseProperty", function(player, square) {
    var checkedproperty = getCheckedProperty();
    var p = player[playerId];

    var HTML = "",
    firstproperty = -1;

    var mortgagetext = "",
    housetext = "";
    var sq;

    for (var i = 0; i < 12; i++) {
        sq = square[i];
        if (sq.owner == playerId) {

            mortgagetext = "";
            if (sq.mortgage) {
                mortgagetext = "title='Hypothek aufgenommen' style='color: grey;'";
            }

            housetext = "";
            if (sq.house >= 1 && sq.house <= 2) {
                for (var x = 1; x <= sq.house; x++) {
                    housetext += "<img src='./client/images/house.png' alt='' title='Haus' class='house' />";
                }
            } 

            if (HTML === "") {
                HTML += "<p>" + player[playerId].name + ", wähle eines der Grundstücke für die Auktion aus, indem du es anklickst. Klicke OK, wenn du fertig bist.</p>";
                HTML += "<table>";
                firstproperty = i;
            }

            HTML += "<tr class='property-cell-row'><td class='propertycellcheckbox'><input type='checkbox' id='propertycheckbox" + i + "' /></td><td class='propertycellcolor' style='background: " + sq.color + ";";

            HTML += "' onmouseover='showdeed(" + i + ");' onmouseout='hidedeed();'></td><td class='propertycellname' " + mortgagetext + ">" + sq.name + housetext + "</td></tr>";
        }
    }

    if (HTML === "") {
        HTML = p.name + ", du besitzt keine Grundstücke.";
        $("#option").hide();
    } else {
        HTML += "</table>";
    }

    popup(HTML, function() {
        var propertyindex = getCheckedProperty();
        socket.emit("auctionHouse", propertyindex);
    }, "ok");

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

        socket.emit('updateOption');
    });


});

function finalizeAuction() {
    socket.emit("finalizeAuction");

    $("#popupbackground").hide();
    $("#popupwrap").hide();
};

socket.on("auction", function(_auctionproperty, _player, _square, _highestbidder, _highestbid) {
    player = _player;
    auctionproperty = _auctionproperty;
    highestbidder = _highestbidder;
    highestbid = _highestbid;
    currentbidder = playerId;

    var s = _square[_auctionproperty];

    popup("<div style='font-weight: bold; font-size: 16px; margin-bottom: 10px;'>Auktion <span id='propertyname'></span></div><div>Höchstes Gebot = $<span id='highestbid'></span> (<span id='highestbidder'></span>)</div><div><span id='currentbidder'></span>, du bist an der Reihe.</div<div><input id='bid' title='Gib ein Gebot für " + s.name + " ab.' style='width: 291px;' /></div><div><input type='button' value='Bieten' onclick='auctionBid();' title='Gib dein Gebot ab.' /><input type='button' value='Aussetzen' title='Diese Runde nicht bieten.' onclick='auctionPass();' /><input type='button' value='Auktion verlassen' title='Nicht mehr für " + s.name + " bieten.' onclick='if (confirm(\"Möchtest du wirklich nicht weiter bieten?\")) auctionExit();' /></div>", "blank");
    document.getElementById("propertyname").innerHTML = "<a href='javascript:void(0);' onmouseover='showdeed(" + auctionproperty + ");' onmouseout='hidedeed();' class='statscellcolor'>" + s.name + "</a>";
    //document.getElementById("highestbid").innerHTML = "0";
    //document.getElementById("highestbidder").innerHTML = "N/A";
    document.getElementById("highestbid").innerHTML = parseInt(highestbid, 10);
    document.getElementById("highestbidder").innerHTML = highestbidder != 0 ? player[highestbidder].name : "N/A";
    document.getElementById("currentbidder").innerHTML = player[currentbidder].name;
    document.getElementById("bid").onkeydown = function (e) {
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
            game.auctionBid();
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

    document.getElementById("bid").onfocus = function () {
        this.style.color = "black";
        if (isNaN(this.value)) {
            this.value = "";
        }
    };
});

//player
function auctionPass() {
    if (highestbidder === 0) {
        highestbidder = currentbidder;
    }
    socket.emit("newbid", highestbidder, highestbid)

    $("#popupbackground").hide();
    $("#popupwrap").hide();

    /*document.getElementById("currentbidder").innerHTML = player[currentbidder].name;
    document.getElementById("bid").value = "";
    document.getElementById("bid").style.color = "black";*/
};

function auctionBid(bid) {
    bid = bid || parseInt(document.getElementById("bid").value, 10);

    if (bid === "" || bid === null) {
        document.getElementById("bid").value = "Gebe ein Gebot ab.";
        document.getElementById("bid").style.color = "red";
    } else if (isNaN(bid)) {
        document.getElementById("bid").value = "Das Gebot muss eine Zahl sein.";
        document.getElementById("bid").style.color = "red";
    } else {
        if (bid > player[currentbidder].money) {
            document.getElementById("bid").value = "Du hast nicht genügend Geld um " + bid + " zu bieten.";
            document.getElementById("bid").style.color = "red";
        } else if (bid > highestbid) {
            highestbid = bid;
            document.getElementById("highestbid").innerHTML = parseInt(bid, 10);
            highestbidder = currentbidder;
            document.getElementById("highestbidder").innerHTML = player[highestbidder].name;

            document.getElementById("bid").focus();

            if (player[currentbidder].human) {
                auctionPass();
            }
        } else {
            document.getElementById("bid").value = "Dein Gebot muss höher sein als das höchste Gebot. ($" + highestbid + ")";
            document.getElementById("bid").style.color = "red";
        }
    }
};

function auctionExit() {
    socket.emit("auctionExit", currentbidder);
    auctionPass();
};

var xValues = [];
var geldMengen = [];
var bankZinsen = []

var myChart = new Chart("myChart", {
  type: "line",
  data: {
    labels: xValues,
    datasets: [{
        backgroundColor: "rgba(255,0,0,1.0)",
        borderColor: "rgba(255,0,0,0.1)",
        data: geldMengen,
        label: "Geldmenge",
        yAxisID: 'y',
    },
    {
        backgroundColor: "rgba(0,0,255,1.0)",
        borderColor: "rgba(0,0,255,0.1)",
        data: bankZinsen,
        label: "Zinsen",
        yAxisID: 'y1',
    }]
  },
  options:{
    responsive: true,
    interaction: {
        mode: 'index',
        intersect: false,
    },
    plugins: {},
    stacked: false,
    scales: {
        y: {
            type: 'linear',
            display: true,
            position: 'left',
        },
        y1: {
            type: 'linear',
            display: true,
            position: 'right',

            grid: {
                drawOnChartArea: false,
            }
        },
    },
  }
});

function openNav() {
    document.getElementById("menulist").style.width = "250px";
}

function closeNav() {
    document.getElementById("menulist").style.width = "0px";
}

function switchMenu() {
    $("#gamemenu").hide();
    $("#returnToLog").show();
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./sw.js')
      .then(() => { console.log('Service Worker Registered'); });
  }  

let deferredPrompt;
const addBtn = document.querySelector('.add-button');
addBtn.style.display = 'none';

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    addBtn.style.display = 'block';
  
    addBtn.addEventListener('click', (e) => {
      // hide our user interface that shows our A2HS button
      addBtn.style.display = 'none';
      // Show the prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
          } else {
            console.log('User dismissed the A2HS prompt');
          }
          deferredPrompt = null;
        });
    });
  });  