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
}

function Card(text, action) {
	this.text = text;
	this.action = action;
}

function corrections() {
	//document.getElementById("cell1name").textContent = "Mediter-ranean Avenue";

	// Add images to enlarges.
	//document.getElementById("enlarge3token").innerHTML += '<img src="images/train_icon.png" height="60" width="65" alt="" style="position: relative; bottom: 20px;" />';
	//document.getElementById("enlarge9token").innerHTML += '<img src="images/train_icon.png" height="60" width="65" alt="" style="position: relative; top: -20px;" />';
}

function utiltext() {
	return '&nbsp;&nbsp;&nbsp;&nbsp;If one "Utility" is owned rent is 4 times amount shown on dice.<br /><br />&nbsp;&nbsp;&nbsp;&nbsp;If both "Utilitys" are owned rent is 10 times amount shown on dice.';
}

function transtext() {
	return '<div style="font-size: 14px; line-height: 1.5;">Rent<span style="float: right;">$25.</span><br />If 2 Railroads are owned<span style="float: right;">50.</span><br />If 3 &nbsp; &nbsp; " &nbsp; &nbsp; " &nbsp; &nbsp; "<span style="float: right;">100.</span><br />If 4 &nbsp; &nbsp; " &nbsp; &nbsp; " &nbsp; &nbsp; "<span style="float: right;">200.</span></div>';
}

function luxurytax() {
	addAlert(player[turn].name + " paid $100 for landing on Luxury Tax.");
	player[turn].pay(100, 0);

	$("#landed").show().text("You landed on Luxury Tax. Pay $100.");
}

function citytax() {
	addAlert(player[turn].name + " paid $200 for landing on City Tax.");
	player[turn].pay(200, 0);

	$("#landed").show().text("You landed on City Tax. Pay $200.");
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
chanceCards[11] = new Card("Du verkaufst an die Person mit dem aktuell niedrigsten Saldo ein Auto. Lass Dir 4.000 überweisen. Kreditaufnahme für Kauf möglich.", function() { subtractamount(50, 'Community Chest');}); //TODO
chanceCards[12] = new Card("Spende\nSpende 10.000 für das Gemeinwohl. Überweise an den Staat.", function() { payState(10000);});
chanceCards[13] = new Card("GEMA\nDie GEMA fordert 1.000 für die Musikbeschallung in deiner Firma. Überweise an den Staat.", function() { payState(1000);});
chanceCards[14] = new Card("Steuererstattung\nDu bekommst 5.000 vom Finanzamt (Staat) erstattet.", function() { payState(-5000);});
