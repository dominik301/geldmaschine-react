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
	this.reset = function() {
	  this.owner = 0;
	  this.mortgage = false;
	  this.mortgageHouse = false;
	  this.house = 0;
	  this.landcount = 0;
  	}
}

var square = [];

square[0] = new Square("Start/Bank", "Wer auf oder über dieses Feld zieht, zahlt Zinsen für alle offenen Kredite.", "yellow");
square[1] = new Square("Kiesweg 1", "Miete:12.000", "rgb(255, 252, 92)", 12000, 36000);
square[2] = new Square("Kiesweg 2", "Miete:14.000", "rgb(255, 252, 92)", 14000, 42000);
square[3] = new Square("Ereignisfeld", "", "transparent");
square[4] = new Square("Alleenring 1", "Miete:22.000", "rgb(119, 248, 140)", 22000, 66000);
square[5] = new Square("Alleenring 2", "Miete:24.000", "rgb(119, 248, 140)", 24000, 72000);
square[6] = new Square("Staat/Finanzamt", "Wer auf oder über dieses Feld zieht, zahlt 10% Steuern aufs aktuelle Guthaben. Zieht Gelb auf oder über dieses Feld zahlt der Staat Zinsen auf alle Anleihen.", "yellow");
square[7] = new Square("Ziegelstraße 1", "Miete:16.000", "red", 16000, 48000);
square[8] = new Square("Ziegelstraße 2", "Miete:16.000", "red", 16000, 48000);
square[9] = new Square("Ereignisfeld", "", "transparent");
square[10] = new Square("Nasse Gasse 1", "Miete:18.000", "rgb(92, 195, 255)", 18000, 54000);
square[11] = new Square("Nasse Gasse 2", "Miete:18.000", "rgb(92, 195, 255)", 18000, 54000);

exports.square = square;