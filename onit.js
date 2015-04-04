#!/usr/bin/env node

var _ = require('lodash');
var fs = require('fs');
var moment = require('moment');
var nconf = require('nconf');
var open = require('open');
var path = require('path');
var pkg = require( path.join(__dirname, 'package.json') );

// Default Settings
var onitDir = path.join(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE, 'onit');
var configFile = path.join(onitDir, 'config.json');

// Default directories
var dayDir = path.join(onitDir, 'days');
var archiveDir = path.join(onitDir, 'archive'); // TODO: implement archiving

// Load the configuration file (will be created if doesn't exist)
nconf.file({ file: configFile });

// Set up commands for onit
var program = require('commander');

program
  .command('init')
  .action(initCommand);

program
  .command('new')
  .alias('n')
  .action(newDay);

program
  .command('today')
  .alias('t')
  .action(getToday);

program
  .command('yesterday')
  .alias('y')
  .action(getYesterday);

program
  .command('open [day]')
  .alias('o')
  .action(openDay);

program
  .command('log')
  .alias('l')
  .action(getLog);

program.parse(process.argv);

// Command for creating directories and config file
function initCommand() {
  // Create directories if they aren't there (make sure onitDir is first)
  [onitDir, dayDir].forEach(function(dir) {
    if (!fs.existsSync(dir)) {
      console.log('Making directory:', dir);
      fs.mkdirSync(dir)
    } else {
      console.log('Onit dir found:', dir);
    }
  })

  console.log('Saving configurations');
  saveConf(function() {
    console.log('Onit initialized!');
  });
}

// Command for creating a new day file
function newDay() {
  // Make up filename
  newDayFileName = moment().format('YYYY-MM-DD') + '.md';
  newDayFilePath = path.join(dayDir, newDayFileName);

  // Create the file if it's not there
  if (fs.existsSync(newDayFilePath)) {
    var message = 'File already exists';
  } else {
    fs.closeSync(fs.openSync(newDayFilePath, 'w'));
    var message = 'New file created';

    // Set yesterday as today
    nconf.set('yesterday', nconf.get('today'));

    // Set today as newDay
    nconf.set('today', newDayFileName);
  }

  saveConf(function() {
    console.log(message, newDayFileName);
  })

  // Open new file in editor
  open(newDayFilePath);
}

// Command for opening today file
function getToday() {
  var todayFilePath = path.join(dayDir, nconf.get('today'));

  if (!nconf.get('today') || !fs.existsSync(todayFilePath)) {
    console.error('Today does not exist');
  } else {
    open(todayFilePath);
  }
}

// Command for opening yesterday file
function getYesterday() {
  var yesterdayFilePath = path.join(dayDir, nconf.get('yesterday'));

  if (!nconf.get('yesterday') || !fs.existsSync(yesterdayFilePath)) {
    console.error('Yesterday does not exist');
  } else {
    open(yesterdayFilePath);
  }
}

// Command for opening a specific day
function openDay(day) {
  var dayFilePath = path.join(dayDir, day + '.md');

  if (fs.existsSync(dayFilePath)) {
    open(dayFilePath);
  } else {
    console.log('File for day not found:', day);
  }
}

// Get your log for yesterday and today together (today is printed first)
function getLog() {
  var todayFilePath = path.join(dayDir, nconf.get('today'));
  var yesterdayFilePath = path.join(dayDir, nconf.get('yesterday'));

  if (fs.existsSync(todayFilePath)) {
    var todayContent = fs.readFileSync(todayFilePath, 'utf8');

    if (fs.existsSync(yesterdayFilePath)) {
      var yesterdayContent = fs.readFileSync(yesterdayFilePath, 'utf8');
      console.log(todayContent, '\n', yesterdayContent);
    } else {
      console.log(todayContent);
    }
  }
}

// Utility function for saving configuration file
function saveConf(cb) {
  nconf.save(function(err) {
    if (err) {
      console.error('Error saving or creating conf file', err);
    }

    if (_.isFunction(cb)) {
      cb();
    }
  });
}
