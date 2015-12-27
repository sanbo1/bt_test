/////////////////////////////////////
// bleacon test
/////////////////////////////////////
// require
var Bt = require("bleacon");
var Gpio = require("onoff").Gpio;
var exec = require('child_process').exec;

var led_red    = new Gpio(23, 'out');	// pin no : 16
var led_yellow = new Gpio(24, 'out');	// pin no : 18
var led_green  = new Gpio(25, 'out');	// pin no : 22

var arrayTimerID = [];
var px = '';
var soundFlg = false;


//
// inner function
//
function initialize() {
	exec('hciconfig hci0 up', function() {});
};

function exit() {
	// All LED turn OFF
	led_red.writeSync(0);
	led_yellow.writeSync(0);
	led_green.writeSync(0);

	// All LED Unexport
	led_red.unexport();
	led_yellow.unexport();
	led_green.unexport();
};


//
// scan start
//
initialize();

console.log("start scanning");
Bt.startScanning();


//
// beacon discoverd
//
Bt.on("discover", function(bleacon) {
	//console.log(bleacon);

	if (px == bleacon.proximity) {
		return;
	}

	//console.log(bleacon.proximity);
	px = bleacon.proximity;

	var resetTimerFlg = false;

	switch (px) {
		case 'immediate':
			led_red.writeSync(0);
			led_yellow.writeSync(0);
			led_green.writeSync(1);
			resetTimerFlg = true;

			var txt = 'ここはきけんです';
			soundFlg = true;
			exec('./jsay.sh ' + txt, function() {
				setTimeout(function() {
					soundFlg = false;
				}, 3000);
			});
			break;
		case 'near':
			led_red.writeSync(0);
			led_yellow.writeSync(1);
			led_green.writeSync(0);
			resetTimerFlg = true;
			break;
		case 'far':
			led_red.writeSync(1);
			led_yellow.writeSync(0);
			led_green.writeSync(0);
			resetTimerFlg = true;
			break;
		case 'unknown':
			led_red.writeSync(1);
			led_yellow.writeSync(1);
			led_green.writeSync(1);
			break;
		default:
			led_red.writeSync(0);
			led_yellow.writeSync(0);
			led_green.writeSync(0);
			break;
	}

	// timer clear
	if (resetTimerFlg == true && arrayTimerID.length > 0) {
		clearTimeout(arrayTimerID.shift());
	}

	// set Timer
	arrayTimerID.push( setTimeout(function() {
		led_red.writeSync(0);
		led_yellow.writeSync(0);
		led_green.writeSync(0);
		arrayTimerID.shift();
	}, 5000));

});


//
// exit
//
process.on("exit", function() {
	console.log("exit bleacon");

	Bt.stopScanning();
	exit();
});

