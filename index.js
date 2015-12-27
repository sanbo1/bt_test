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

//var uuid = "95F428B1-4A3A-4E39-B086-21BFF38DEB6D";	// NG
//var uuid = "95F428B14A3A4E39B08621BFF38DEB6D";		// NG
//var uuid = "95f428b1-4a3a-4e39-b086-21bff38deb6d";	// NG
var uuid = "95f428b14a3a4e39b08621bff38deb6d";			// ハイフンなし、小文字 でないと認識しない
var major = 440;
var minor = 287;

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
//Bt.startScanning();
//Bt.startScanning(uuid);
//Bt.startScanning(uuid, major);
Bt.startScanning(uuid, major, minor);


//
// beacon discoverd
//
Bt.on("discover", function(bleacon) {
	//console.log(bleacon);

	// timer clear
	if (arrayTimerID.length > 0) {
		clearTimeout(arrayTimerID.shift());
	}

	// set Timer
	arrayTimerID.push( setTimeout(function() {
		led_red.writeSync(0);
		led_yellow.writeSync(0);
		led_green.writeSync(0);
		arrayTimerID.shift();
	}, 5000));

	if (px == bleacon.proximity) {
		return;
	}

	//console.log(bleacon.uuid);
	//console.log(bleacon.proximity);
	px = bleacon.proximity;

	switch (px) {
		case 'immediate':
			led_red.writeSync(0);
			led_yellow.writeSync(0);
			led_green.writeSync(1);

			if (soundFlg == false) {
				var txt = 'ここはきけんです';
				soundFlg = true;
				exec('./jsay.sh ' + txt, function() {
					soundFlg = false;
				});
			}
			break;
		case 'near':
			led_red.writeSync(0);
			led_yellow.writeSync(1);
			led_green.writeSync(0);
			break;
		case 'far':
			led_red.writeSync(1);
			led_yellow.writeSync(0);
			led_green.writeSync(0);
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

});


//
// exit
//
process.on("exit", function() {
	console.log("exit bleacon");

	Bt.stopScanning();
	exit();
});

