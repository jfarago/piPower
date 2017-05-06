exports.getCpuTemp = getCpuTemp;
exports.getPiStats = getPiStats;

function getCpuTemp() {

	return new Promise(function(resolve, reject) {
		var fileName = "/sys/class/thermal/thermal_zone0/temp";
		var tempC = '0';
		var tempF = '0';

		fs.exists(fileName, function(exists) {
			if (exists) {
				fs.readFile(fileName, "utf8", function(error, data) {
					tempC = Math.round((Math.floor((parseInt(data) / 1000) * 10) / 10) * 100) / 100;
					tempF = Math.round((tempC * 1.8 + 32) * 100) / 100;
					resolve(tempF);
				});
			}
		});
		//will always return 0 look into creating a promise
	});
}

function getPiStats() {
	/*return {
	 "os": {
	 "sum": os.type() + " : " + os.release(),
	 "type": os.type(),
	 "platform": os.platform()
	 },
	 "uptime": formatTime(os.uptime()),
	 "hostname": os.hostname(),
	 "performance": {
	 "cpu": os.cpus(),
	 "load": Math.round(os.loadavg()[1] * 100),
	 "temperture": getCpuTemp(),
	 "memory": {
	 "free": Math.floor((os.freemem() / 1024) / 1024) + "MB",
	 "use": Math.floor(((os.totalmem() - os.freemem()) / 1024) / 1024) + "MB",
	 "total": Math.floor((os.totalmem() / 1024) / 1024) + "MB",
	 "percentage": Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
	 }
	 }
	 }*/
}