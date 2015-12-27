var bt = require("bleacon");

console.log("start scanning");
bt.startScanning();

bt.on("discover", function(bleacon) {
	console.log(bleacon);
});

process.on("exit", function() {
	console.log("exit bleacon");

	bt.stopScanning();
});

