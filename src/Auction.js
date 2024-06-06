

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
                    housetext += "<i class=\"fa-solid fa-house\" title='Haus' class='house' ></i>";
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
    $(".property-cell-row").on('click', function() {
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

//player
function auctionPass() {
  //TODO
    if (highestbidder === 0) {
        highestbidder = currentbidder;
    }
    socket.emit("newbid", highestbidder, highestbid)

    $("#popupbackground").hide();
    $("#popupwrap").hide();

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



function finalizeAuction() {
    socket.emit("finalizeAuction");

    $("#popupbackground").hide();
    $("#popupwrap").hide();
};

socket.on("auction", function(_auctionproperty, _player, _square, _highestbidder, _highestbid) {
    rcvAuction(_auctionproperty, _player, _square, _highestbidder, _highestbid)
});

function rcvAuction(_auctionproperty, _player, _square, _highestbidder, _highestbid) {
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
}