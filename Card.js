function Card(title, text, action) {
	this.title = title;
    this.text = text;
	this.action = action;
}

function payplayer(game, position, amount) {
	var receiver = game.turn + position;
	var nPlayer = game.pcount
	
	if (receiver < 0) {
		receiver = nPlayer;
	}
	if (receiver > nPlayer) {
		receiver = 1;
	}

	var p = game.player[game.turn];

	game.player[receiver].money += amount;

	p.pay(amount, receiver);

	if (amount < 0) {
		game.addAlert(p.name + " hat " + (-amount) + " von " + game.player[receiver].name + " erhalten.");
	} else {
		game.addAlert(p.name + " hat " + amount + " an " + game.player[receiver].name + " gezahlt.");
	}

}

function receiveBankguthaben(game) {
	var p = game.player[game.turn];
	  p.money += game.meineBank.zinsenLotto;
	  game.meineBank.zinsenLotto = 0;
  }

  function advance(game, destination, pass) {
	var p = game.player[game.turn];
	var p_old = p.position
	if (typeof pass === "number") {
		if (p.position < pass) {
			p.position = pass;
		} else {
			p.position = pass;
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
	}
	if (p.position < destination) {
		p.position = destination;
	} else {
		p.position = destination;
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
	game.updatePosition(p_old);
	game.land();
}

function sellPoorest(game, amount) {
	
	var poorest;
	var idx = 0;
	var money = 1e6;
	for (var i = 1; i <= game.pcount; i++) {
		p = game.player[i];
		if (p.money <= money) {
			poorest = p;
			money = p.money;
			idx = i;
		}
	}

	var p = game.player[game.turn];

	p.money += amount;

	poorest.pay(amount, idx);

	game.addAlert(poorest.name + " hat " + amount + " an " + p.name + "gezahlt.");

	return poorest.index
}

function sellRichest(game, amount) {
	
	var richest;
	var idx = 0;
	var money = -1e6;
	for (var i = 1; i <= game.pcount; i++) {
		p = game.player[i];
		if (p.money >= money) {
			richest = p;
			money = p.money;
			idx = i;
		}
	}

	var p = game.player[game.turn];

	p.money += amount;

	richest.pay(amount, idx);

	game.addAlert(richest.name + " hat " + amount + " an " + p.name + " gezahlt.");
}

function receiveFromBank(game, amount, key) {
	var p = game.player[key];
	p.money += amount
	game.meineBank.derivateEmittieren(amount);
	game.meineBank.zinsenLotto -= amount;
}

var chanceCards = []
exports.chanceCards = chanceCards;

chanceCards[0] = new Card("TÜV","Dein Auto muss zum TÜV. Zahle 5.000 an die Werkstatt: Linke/r Mitspieler*in.", function(game) { 
	payplayer(game,1, 5000);});
chanceCards[1] = new Card("Konsum","Du kaufst ein Motorrad. Überweise 8.000 an die Person rechts neben Dir.", function(game) { 
	payplayer(game,-1, 8000); game.player[game.turn].motorrad += 1;});
chanceCards[2] = new Card("Urlaub","Mache Urlaub im Umland. Überweise 6.000 anteilig an alle, da sie für Dich kochen, putzen, singen...", function(game) { 
	game.payeachplayer(6000,"Ereignisfeld");});
chanceCards[3] = new Card("Lobbyarbeit","Der Besuch des Opernballs kostet Dich 3.000. Überweise an den Staat.", function(game) { 
	game.payState(3000);});
chanceCards[4] = new Card("Geburtstag","Du hast einen runden Geburtstag. Die Party kostet 6.000. Überweise an alle Mitspieler*innen.", function(game) { 
	game.payeachplayer(6000,"Ereignisfeld");});
chanceCards[5] = new Card("KFZ-Steuer","Zahle für Deinen Fahrzeugpark 4.000 Kfz-Steuer an den Staat.", function(game) { 
	game.payState(4000);});
chanceCards[6] = new Card("Strafticket","Du musst Deine Fahrerlaubnis erneuern. Überweise 3.000 an den Staat.", function(game) { 
	game.payState(3000);});
chanceCards[7] = new Card("Hauptgewinn","Glückwunsch! Du hast im Lotto gewonnen und erhältst das gesamte Bankguthaben als Gewinn.", function(game) { 
	receiveBankguthaben(game);});
chanceCards[8] = new Card("Zuzahlung","Du warst zur Kur und musst 2.000 zuzahlen. Überweise an den Staat.", function(game) { 
	game.payState(2000);});
chanceCards[9] = new Card("Banküberfall","Du hast die Bank überfallen und den Tresor geräumt. Die Bank überweist Dir ihr gesamtes Guthaben.", function(game) { 
	receiveBankguthaben(game);});
chanceCards[10] = new Card("Finanzamt","Rücke direkt ins Finanzamt vor und zahle Steuern auf dein aktuelles Guthaben.", function(game) { 
	advance(game, 6);}); //TODO Du kannst vorher andere Geschäfte tätigen.
chanceCards[11] = new Card("Gebrauchtwagen", "Du verkaufst an die Person mit dem aktuell niedrigsten Saldo ein Auto. Lass Dir 4.000 überweisen. Kreditaufnahme für Kauf möglich.", function(game) { 
	var _p = sellPoorest(game,4000); game.player[_p].auto += 1;});
chanceCards[12] = new Card("Spende","Spende 10.000 für das Gemeinwohl. Überweise an den Staat.", function(game) { 
	game.payState(10000);});
chanceCards[13] = new Card("GEMA","Die GEMA fordert 1.000 für die Musikbeschallung in deiner Firma. Überweise an den Staat.", function(game) { 
	game.payState(1000);});
chanceCards[14] = new Card("Steuererstattung","Du bekommst 5.000 vom Finanzamt (Staat) erstattet.", function(game) { 
	game.payState(-5000);});

var chanceCards2 = []
exports.chanceCards2 = chanceCards2;

chanceCards2[0] = new Card("Steuerforderung","Zahle 10.000 an den Staat.", function(game) { 
	game.payState(10000);});
chanceCards2[1] = new Card("Konsum","Du verkaufst der/dem Reichsten eine Yacht für 40.000.", function(game) { 
	sellRichest(game,40000); game.player[game.turn].yacht += 1;});
chanceCards2[2] = new Card("Wasserrohrbruch","Zahle für die Reparatur 8.000 an Deine*n rechte*n Mitspieler*in", function(game) { 
	payplayer(game,-1, 8000);});
chanceCards2[3] = new Card("Studiengebühren","Deine Tochter macht ein Auslandssemester. Du unterstützt sie mit 15.000. Überweise an den Staat.", function(game) { 
	game.payState(15000);});
chanceCards2[4] = new Card("Investitionsbeihilfe","Der Staat übernimmt 10% deiner Baukosten, wenn du ein 2. Haus auf eins Deiner Grundstücke baust. Du darfst keine Miete dafür erheben. Steuerbegünstigter Leerstand um Geld in Umlauf zu bringen! Du kannst Kredit aufnehmen.", function(game) { 
	game.percent=10; game.buyHouse2(); game.updateOption();});
chanceCards2[5] = new Card("Feuerschaden","Nach Hausbrand zahlt die Versicherung (Staat) 48.000. Du renovierst und überweist das Geld anteilig an alle.", function(game) { 
	game.payState(-48000); game.payeachplayer(48000, "Ereignisfeld");});
chanceCards2[6] = new Card("Heizungsreparatur","Für die Reparatur bekommst du 10.000 von der Person rechts neben Dir.", function(game) { 
	payplayer(game,-1, -10000);}); //TODO Zum Bezahlen kann außerplanmäßig ein Kredit aufgenommen werden.
chanceCards2[7] = new Card("Steuerfahndung","Dir wurde Steuerhinterziehung nachgewiesen. Überweise 50% Deines Guthabens an den Staat.", function(game) { 
	game.payState(game.player[game.turn].money * 0.5);});
//chanceCards2[8] = new Card("Fensterreparatur","Du hast im Haus auf diesem Feld die Fenster repariert. Der/die Eigentümer*in zahlt Dir 15.000. Dafür ist Kreditaufnahme möglich.", function() {}); //?
chanceCards2[8] = new Card("Feinstaubplaketten","Kaufe Plaketten für deinen Fahrzeugpark. Zahle 1.000 an den Staat.", function(game) { 
	game.payState(1000);});
chanceCards2[9] = new Card("Investitionsbeihilfe","Wenn Du jetzt baust, zahlt der Staat 20.000 dazu. Du darfst ein 2. Haus auf eins Deiner Grundstücke bauen, aber keine Miete dafür erheben. Steuerbegünstigter Leerstand um Geld in Umlauf zu bringen! Du kannst Kredit aufnehmen.", function(game) { 
	game.discount=20000; game.buyHouse2(); game.updateOption();});
chanceCards2[10] = new Card("Hackerangriff","Du hast die Bank gehackt und 80.000 erpresst. Die Bank schöpft das Geld durch Emission von Derivaten.", function(game) { 
	receiveFromBank(game,80000,game.turn);});
chanceCards2[11] = new Card("Einbauküche","Du kaufst für 24.000 eine Einbauküche. Überweise den Betrag anteilig an alle Mitspieler*innen", function(game) { 
	game.payeachplayer(24000, "Ereignisfeld");});
chanceCards2[12] = new Card("Erbstreit","Wegen eines Erbstreits musst Du ein Grundstück versteigern. Die Hälfte des Erlöses zahlst du anteilig an alle aus.", function(game) { 
	game.auctionHouse();});
chanceCards2[13] = new Card("Beitragserhöhung","Deine Krankenkasse erhöht die Beiträge. Zahle 3.000 an den Staat.", function(game) { 
	game.payState(3000);});