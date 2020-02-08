const gpio = require("gpio");

exports.initiatePins = initiatePins;

function initiatePins(pinArray) {
	var tempPinArray = [];
	for (var i = 0; i < pinArray.length; i++) {
		console.log(JSON.stringify(pinArray[i]));
		var gpios = gpio.export(pinArray[i].pinNumber, {
			direction: pinArray[i].direction,
			ready: function() {
				this.set();
			}
		});

		gpios.description = pinArray[i].description;
		gpios.schedule = pinArray[i].schedule;

		tempPinArray.push(gpios);
	}
	return tempPinArray;
}
