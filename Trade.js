module.exports = function Trade(initiator, recipient, money, property, anleihen=0, derivate=0) {
	// For each property and anleihen or derivate, 1 means offered, -1 means requested, 0 means neither.
  this.initiator = initiator;
  this.recipient = recipient;
  this.money = money;
  this.property = property;
  this.anleihen = anleihen;
  this.derivate = derivate;

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