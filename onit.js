#!/usr/bin/env node

var _ = require('lodash');
var copyPaste = require('copy-paste');
var fs = require('fs');
var github = require('octonode');
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

program.version(pkg.version);

program
  .command('init')
  .description('Initialize Onit directory')
  .action(initCommand);

program
  .command('new')
  .alias('n')
  .description('Create file for new day')
  .option('-e, --empty [empty]', 'Create empty file', false)
  .option('-o, --overwrite [overwrite]', 'Overwrite if file exists', false)
  .action(newDay);

program
  .command('today')
  .alias('t')
  .description('Open file for today if it exists')
  .action(getToday);

program
  .command('yesterday')
  .alias('y')
  .description('Open file for yesterday if it exists')
  .action(getYesterday);

program
  .command('open [day]')
  .alias('o')
  .description('Open file for a given date')
  .action(openDay);

program
  .command('log')
  .alias('l')
  .description('Log yesterday and today')
  .action(getLog);

program
  .command('gist')
  .alias('g')
  .description('Create Gist of file for today')
  .action(createGist);

program
  .command('yesterday_gist [url]')
  .alias('yg')
  .description('Set yesterday file as Gist content')
  .action(yesterdayGist);

program.parse(process.argv);

// Command for creating directories and config file
function initCommand() {
  // Create directories if they aren't there (make sure onitDir is first)
  [onitDir, dayDir, archiveDir].forEach(function(dir) {
    if (!fs.existsSync(dir)) {
      console.log('Making directory:', dir);
      fs.mkdirSync(dir)
    } else {
      console.log('Onit dir found:', dir);
    }
  });

  nconf.set('fileHeader', 'dddd MMM.DD.YYYY')

  console.log('Saving configurations');
  saveConf(function() {
    console.log('Onit initialized!');
  });
}

// Command for creating a new day file
function newDay(options) {
  var data;
  var fileExists;

  // Make up filename
  newDayFileName = moment().format('YYYY-MM-DD') + '.md';
  newDayFilePath = path.join(dayDir, newDayFileName);

  // Create the file if it's not there
  fileExists = fs.existsSync(newDayFilePath);

  if (!options.overwrite && fileExists) {
    return console.log('File already exists', newDayFileName);
  } else {
    // Allow the user to create an empty file
    data = options.empty ? '' : '# ' + moment().format(nconf.get('fileHeader')) + '\n\n';

    fs.writeFileSync(newDayFilePath, data);

    // Make today into yesterday
    if ((!options.overwrite && fileExists) || !fileExists)  {
      // Set yesterday as today
      nconf.set('yesterday', nconf.get('today'));

      // Set today as newDay
      nconf.set('today', newDayFileName);
    }

    saveConf(function() {
      console.log('New file created', newDayFileName);
    })
  }

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
  var log = '';
  var todayFilePath = path.join(dayDir, nconf.get('today'));
  var yesterdayFilePath;

  if (nconf.get('yesterday')) {
    yesterdayFilePath = path.join(dayDir, nconf.get('yesterday'));
  }

  if (fs.existsSync(todayFilePath)) {
    var todayContent = fs.readFileSync(todayFilePath, 'utf8');

    if (yesterdayFilePath && fs.existsSync(yesterdayFilePath)) {
      var yesterdayContent = fs.readFileSync(yesterdayFilePath, 'utf8');
      log = todayContent + '\n' + yesterdayContent;
    } else {
      log = todayContent;
    }
  } else {
    return console.error('Today file not found:', todayFilePath);
  }

  copyPaste.copy(log);
  console.log(log);
}

function createGist() {
  var client;
  var gistData;
  var ghgist;

  var todayFilePath = path.join(dayDir, nconf.get('today'));

  if (!fs.existsSync(todayFilePath)) {
    return console.log('Cannot create Gist - file does not exist', todayFilePath);
  }

  gistData = fs.readFileSync(todayFilePath, 'utf8');

  if (gistData) {
    client = github.client(nconf.get('githubToken'));
    ghgist = client.gist();

    files = {};
    files[nconf.get('today')] = {
      content: gistData
    };

    ghgist.create({ files: files }, function(err, payload) {
      if (err) {
        return console.error('Could not create Gist');
      }

      console.log('Gist created at ' + payload.html_url);
      console.log('URL copied to clipboard')
      copyPaste.copy(payload.html_url);
      open(payload.html_url);
    });
  }
}

function yesterdayGist(url) {
  var content;
  var id;
  var yesterdayFilePath;

  if (!url) {
    return console.error('Must enter URL of Gist');
  }

  yesterdayFilePath = path.join(dayDir, nconf.get('yesterday'));

  id = _.last(url.split('/'));

  client = github.client(nconf.get('githubToken'));
  ghgist = client.gist();

  ghgist.get(id, function(err, payload) {
    if (err) {
      return console.error('Error getting Gist', err);
    }

    // Get the content of the first file
    content = _.first(_.map(payload.files, function(file) {
      return file.content;
    }));

    fs.writeFileSync(yesterdayFilePath, content);
    console.log('File from Gist writtent to yesterday file');
  });
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
