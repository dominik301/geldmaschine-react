module.exports = class Trade { 
  constructor({ initiator, recipient, money, property, anleihen = 0, derivate = 0, assets = [] }) {
    // Assign values to class properties
    this.initiator = initiator;
    this.recipient = recipient;
    this.money = money;
    this.property = property;
    this.anleihen = anleihen;
    this.derivate = derivate;
    this.assets = assets;
  }

	getInitiator = function() {
		return initiator;
	};

	getRecipient = function() {
		return recipient;
	};

	getProperty = function(index) {
		return property[index];
	};

	getMoney = function() {
		return money;
	};

	getAnleihen = function() {
		return anleihen;
	};

	getDerivate = function() {
		return derivate;
	};

	getAssets = function() {
		return assets;
	}
}