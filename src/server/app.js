var express = require('express');
var path = require('path');
var fs = require("fs");
var os = require("os");
var sensor = require('ds18x20');
var auth = require('http-auth');
var https = require('https');

const time = require('./time.js');
const gpio = require('./gpio.js');
const piStats = require('./piStats.js');

sensor.isDriverLoaded(function(err) {
  if (err) {
    console.log('something went wrong loading the driver:', err);
  } else {
    console.log('Driver is Loaded');

    sensor.list(function(err, listOfDeviceIds) {
      if (err) {
        console.log('Sensor Error: ensure you have enabled w1-gpio in /boot/config.txt');
        console.error(err);
      } else {
        console.log('Temperature Sensors: ', listOfDeviceIds);
      }
    });
  }
});

var config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));
var outlets = gpio.initiatePins(config.pins);

var temperatureProbes = {
  leftLight: {
    id: '28-000006700b67',
    temperature: ''
  },
  rightLight: {
    id: '28-0000066e8a8a',
    temperature: ''
  },
  aquarium: {
    id: '28-0000068a4a89',
    temperature: ''
  }
};

var basicAuth = auth.basic({
  realm: "SECRET",
  file: __dirname + "/users.htpasswd"
});

var app = express();
var serverOptions = {
  key: fs.readFileSync(__dirname + '/private.key'),
  cert: fs.readFileSync(__dirname + '/certificate.pem')
};

app.use(auth.connect(basicAuth));

app.use(express.static(path.join(__dirname, '../')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET,PUT");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

https.createServer(serverOptions, app).listen(443, '0.0.0.0', function() {
  var host = this.address().address;
  var port = this.address().port;

  console.log('Starting up server at https://%s:%s', host, port);
});

app
  .get('/', function(req, res) {
    res.redirect('index.html');
  })

  .get('/api/outlets', function(req, res) {
    res.send(message('Success', {
      value: outlets
    }));
  })

  .get('/api/outlets/:pin', function(req, res) {
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

  .put('/api/outlets/:pin/:bool', function(req, res) {
    var pin = req.params.pin;
    var bool = req.params.bool;
    var state = bool == 1 ? 'On' : 'Off';

    for (var i = 0; i < outlets.length; i++) {
      if (outlets[i].headerNum == pin) {
        console.log('Setting GPIO ' + pin + ' ' + state  +  ' ' + new Date());
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

  .get('/api/temperature_probes', function(req, res) {
    sensor.getAll(function(err, probeObj) {
      for (thermometer in temperatureProbes) {
        for (probe in probeObj) {
          if (temperatureProbes[thermometer].id == probe) {
            temperatureProbes[thermometer].temperature = Math.round((probeObj[probe] * 1.8 + 32) * 100) / 100;
          }
        }
      }
      res.send(message('Success', {
        value: temperatureProbes
      }));
    });
  })

  .get('/api/unit/info', function(req, res) {

    getCpuTemp()
      .then(function(temp) {
        res.send(message('Success', {
          value: {
            "os": {
              "sum": os.type() + " : " + os.release(),
              "type": os.type(),
              "platform": os.platform(),
              "release": os.release()
            },
            "uptime": formatTime(os.uptime()),
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

function message(status, message) {
  return {
    'status': status,
    'message': message
  }
}
