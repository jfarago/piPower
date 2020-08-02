const express = require('express');
const path = require('path');
const fs = require("fs");
const os = require("os");
const sensor = require('ds18x20');
const auth = require('http-auth');
const https = require('https');
const dhtSensor = require('node-dht-sensor');

const time = require('./time.js');
const gpio = require('./gpio.js');
const piStats = require('./piStats.js');
const scheduler = require('./scheduler');
const notifications = require('./notifications');

notifications.sendMessage('Booting up')

const config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));
const outlets = gpio.initiatePins(config.pins);
const schedule = scheduler.createSchedule(config.pins, outlets);
const temperatureProbes = config.temperatureProbes || [];

const basicAuth = auth.basic({
  realm: "SECRET",
  file: __dirname + "/users.htpasswd"
});

const app = express();
const serverOptions = {
  key: fs.readFileSync(__dirname + '/private.key'),
  cert: fs.readFileSync(__dirname + '/certificate.pem')
};

var dhtSensorHistory = [];

// Get initial reading of temperature
if (config.dhtSensor) {
  setTimeout(function() {
    dhtSensor.read(config.dhtSensor.type, 4, function (err, temperature, humidity) {
      console.log("DHT Type is (11/22): " + config.dhtSensor.type);
      if (err) {
        console.log('Something went wrong when reading DHT Sensor:', err);
      } else {
        console.log('DHT11/DHT22 Driver is Loaded');
        console.log('Temp: ' + formatTemperature(temperature, config.dhtSensor.offset) + '°F, ' +
          'Humidity: ' + humidity.toFixed(1) + '%'
        );
        dhtSensorHistory.push({temperature: formatTemperature(temperature, config.dhtSensor.offset), humidity: humidity.toFixed(1)});
      }
    });
  }, 1000)
}

sensor.isDriverLoaded(function (err) {
  if (err) {
    console.log('Something went wrong loading the DS18B20 driver:', err);
  } else {
    console.log('DS18B20 Driver is Loaded');

    sensor.list(function (err, listOfDeviceIds) {
      if (err) {
        console.log('DS18B20 Sensor Error: ensure you have enabled w1-gpio in /boot/config.txt and reboot');
        console.error(err);
      } else {
        console.log('DS18B20 Temperature Sensors: ', listOfDeviceIds);
      }
    });
  }
});

setInterval(function () {
  // Check probe temps and send a message if they exceed the configured threshold
  var probes = getTemperatureProbes();
  if (probes.length) {
    probes.map(probe => {
      if (probe.temperature > probe.alert) {
        notifications.sendMessage(`${probe.name} temperature exceeded. Current temp is ${probe.temperature}`)
      }
    })
  }
}, 300000); // 5 Minutes

setInterval(function() {
  // Save 24 log of temp/humidity sensor
  if (config.dhtSensor) {
    dhtSensor.read(config.dhtSensor.type, 4, function (err, temperature, humidity) {  
      if (err) {
        console.log('Something went wrong when reading DHT Sensor:', err);
      } else {
        console.log("Logging Temperature to log");
        //Limit log to 1 day
        if(dhtSensorHistory.length >= 24) {
          dhtSensorHistory.shift();
        }
        dhtSensorHistory.push({temperature: formatTemperature(temperature, config.dhtSensor.offset), humidity: humidity.toFixed(1)});
      }
    });
  }
}, 3600000); // 1 hour

app.use(auth.connect(basicAuth));

app.use(express.static(path.join(__dirname, '../src/')));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,PUT");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

https.createServer(serverOptions, app).listen(config.app.port, '0.0.0.0', function () {
  const host = this.address().address;
  const port = this.address().port;

  console.log('Starting up server at https://%s:%s', host, port);
});

app
  .get('/', function (req, res) {
    res.redirect('index.html');
  })

  .get('/api/app-config', function (req, res) {
    res.send(message('Success', {
      value: config.app
    }));
  })

  .get('/api/outlets', function (req, res) {
    res.send(message('Success', {
      value: outlets
    }));
  })

  .get('/api/outlets/:pin', function (req, res) {
    var pin = req.params.pin;

    for (var i = 0; i < outlets.length; i++) {
      if (outlets[i].headerNum == pin) {
        res.send(message('Success', {
          value: outlets[i].value
        }));
      } else {
        if (i === outlets.length - 1 && res._headerSent === false) {
          res.send(message('Error', 'Pin is not registered, check /api/outputs for list of registered pins'));

        }
      }
    }
  })

  .put('/api/outlets/:pin/:bool', function (req, res) {
    var pin = req.params.pin;
    var bool = req.params.bool;
    var state = bool == 1 ? 'On' : 'Off';

    for (var i = 0; i < outlets.length; i++) {
      if (outlets[i].headerNum == pin) {
        console.log('Setting ' + outlets[i].description + ' ' + state + ' ' + new Date());
        outlets[i].set(parseInt(bool));
        res.send(message('Success', {
          value: state
        }));
      } else {
        if (i === outlets.length - 1 && res._headerSent === false) {
          res.send(message('Error', 'Pin is not registered, check /api/outputs for list of registered pins'));
        }
      }
    }
  })

  .get('/api/temperature_probes', function (req, res) {
    res.send(message('Success', {
      value: getTemperatureProbes()
    }));
  })

  .get('/api/ambient', function(req, res) {
    if (config.dhtSensor) {
      dhtSensor.read(config.dhtSensor.type, 4, function (err, temperature, humidity) {
        if (err) {
          console.log('Something went wrong loading the DHT driver:', err);
        } else {
          res.send(message('Success', {
            temperature: formatTemperature(temperature, config.dhtSensor.offset),
            humidity: humidity.toFixed(1),
            log: dhtSensorHistory
          }));
        }
      });
    } else {
      res.send(message('Fail', {
        value: "No DHT sensor configured."
      }));
    }
  })

  .get('/api/unit/info', function (req, res) {

    getCpuTemp()
      .then(function (temp) {
        res.send(message('Success', {
          value: {
            "os": {
              "sum": os.type() + " : " + os.release(),
              "type": os.type(),
              "platform": os.platform(),
              "release": os.release()
            },
            "uptime": time.formatTime(os.uptime()),
            "hostname": os.hostname(),
            "performance": {
              "cpu": os.cpus(),
              "load": Math.round(os.loadavg()[1] * 100),
              "temperature": temp,
              "memory": {
                "free": Math.floor((os.freemem() / 1024) / 1024) + "MB",
                "use": Math.floor(((os.totalmem() - os.freemem()) / 1024) / 1024) + "MB",
                "total": Math.floor((os.totalmem() / 1024) / 1024) + "MB",
                "percentage": Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
              }
            }
          }
        }));
      });
  });

function getTemperatureProbes() {
  var probeObj = sensor.getAll();
  if (temperatureProbes.length) {
    temperatureProbes.map(thermometer => {
      for (probe in probeObj) {
        if (thermometer.id == probe) {
          thermometer.temperature = formatTemperature(probeObj[probe], thermometer.offset)
        }
      }
    })
    return temperatureProbes
  } else {
    return "No probes configured";
  }
}

function message(status, message) {
  return {
    'status': status,
    'message': message
  }
}

function formatTemperature(temp, offset) {
  return (temp * 1.8 + 32  + offset).toFixed(1)
}
