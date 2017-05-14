const schedule = require('node-schedule');

var currentJobs = [];

exports
  .createSchedule = createSchedule;

function createSchedule(config, outlets) {
  for (var i = 0; i < config.length; i++) {
    if (config[i].schedule) {
      if (config[i].schedule.on && config[i].schedule.off) {
        //create closure to have access later
        (function(outlet, config) {
          newJob(config.schedule.on, function() {
              console.log('Setting GPIO ' + outlet.description + ' on from scheduler ' + new Date());
              outlet.set(1);
            });
            newJob(config.schedule.off, function() {
              console.log('Setting ' + outlet.description + ' off from scheduler ' + new Date());
              outlet.set(0);
            });
        })(outlets[i], config[i]);
      } else {
        console.log("Error: Ensure you have on and off cron times")
      }
    }
  }
  return currentJobs;
}

function newJob(cronTime, callback) {
  var job = schedule.scheduleJob(cronTime, callback);
  currentJobs.push(job);
}
