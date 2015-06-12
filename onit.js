#!/usr/bin/env node

var _ = require('lodash');
var copyPaste = require('copy-paste');
var fs = require('fs');
var moment = require('moment');
var nconf = require('nconf');
var open = require('open');
var path = require('path');
var pkg = require( path.join(__dirname, 'package.json') );
var slug = require('slug');

// Default Settings
var onitDir = path.join(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE, 'onit');
var configFile = path.join(onitDir, 'config.json');

// Default directories
var dayDir = path.join(onitDir, 'days');
var archiveDir = path.join(onitDir, 'archive'); // TODO: implement archiving
var noteDir = path.join(onitDir, 'notes');
var queryDir = path.join(onitDir, 'query');

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
  .option('-c, --copy [copy]', 'Copy in contents of yesterday', false)
  .option('-d, --date [date]', 'Give a date, useful if you missed a day (YYYY-MM-DD)')
  .option('-i, --incomplete', 'Copy over incomplete tasks')
  .action(newDay);

program
  .command('today')
  .alias('t')
  .description('Open file for today if it exists')
  .action(getToday);

program
  .command('prep')
  .description('Open the file for the day you just completed')
  .action(getToday);

program
  .command('yesterday')
  .alias('y')
  .description('Open file for yesterday if it exists')
  .action(getYesterday);

program
  .command('plan [date]')
  .description('Plan for a given date (YYYY-MM-DD)')
  .action(planForDate);

program
  .command('open [day]')
  .alias('o')
  .description('Open file for a given date (YYYY-MM-DD)')
  .action(openDay);

program
  .command('log')
  .alias('l')
  .description('Log yesterday and today')
  .action(getLog);

program
  .command('note [title]')
  .option('-d, --date [date]', 'Prepend with date (will use YYYY-MM-DD)', false)
  .description('Create a note optionally timestamped with current date')
  .action(createNote);

program
  .command('folder [folder]')
  .alias('f')
  .description('Open day or notes folder')
  .action(openFolder);

program
  .command('last [count]')
  .option('-s, --save', 'Save to file and open', false)
  .description('Get the last number of files')
  .action(lastFiles);

program.parse(process.argv);

// Command for creating directories and config file
function initCommand() {
  // Create directories if they aren't there (make sure onitDir is first)
  [onitDir, dayDir, noteDir, archiveDir, queryDir].forEach(function(dir) {
    if (!fs.existsSync(dir)) {
      console.log('Making directory:', dir);
      fs.mkdirSync(dir)
    } else {
      console.log('Onit dir found:', dir);
    }
  });

  if (!nconf.get('fileHeader')) {
    nconf.set('fileHeader', 'dddd MMM.DD.YYYY');
  }

  nconf.set('copyIncomplete', false);

  console.log('Saving configurations');
  saveConf(function () {
    console.log('Onit initialized!');
  });
}

function _setNewDay(dayFileName) {
  // Set yesterday as previous today
  nconf.set('yesterday', nconf.get('today'));

  // Set day given as newDay
  nconf.set('today', dayFileName);
}

// Command for creating a new day file
function newDay(options) {
  var content;
  var todayDate;
  var fileExists;

  // Make up filename
  newDayFileName = moment(options.date).format('YYYY-MM-DD') + '.md';
  newDayFilePath = path.join(dayDir, newDayFileName);

  // Create the file if it's not there
  fileExists = fs.existsSync(newDayFilePath);

  if (!options.overwrite && fileExists) {
    console.log('File already exists', newDayFileName);

    if (newDayFileName !== nconf.get('today')) {
      _setNewDay(newDayFileName);
    }
  } else {
    // Allow the user to create an empty file
    content = options.empty ? '' : '# ' + moment(options.date).format(nconf.get('fileHeader')) + '\n\n';

    // If the user used the copy flag, copy the contents of yesterday (which is currently today)
    if (options.copy) {
      content += fs.readFileSync(path.join(dayDir, nconf.get('today'))) + '\n';
    } else if (options.incomplete || nconf.get('copyIncomplete') === true) {
      // Copy over incomplete tasks if any are found in the file
      var todayFileLines = fs
        .readFileSync(path.join(dayDir, nconf.get('today')))
        .toString()
        .split('\n');

      // Incomplete tasks begin with '- [ ]'
      todayFileLines.forEach(function(line) {
        if (_.startsWith(line, '- [ ]')) {
          content += line + '\n';
        }
      });
    }

    fs.writeFileSync(newDayFilePath, content);

    // Make today into yesterday
    if ((!options.overwrite && fileExists) || !fileExists)  {
      _setNewDay(newDayFileName);
    }
  }

  saveConf(function () {
    console.log('New file created', newDayFileName);
    return open(newDayFilePath);
  });
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

function planForDate(day) {
  var dayFilePath = path.join(dayDir, day + '.md');

  if (!fs.existsSync(dayFilePath)) {
    console.log('Creating file for day:', day);
    var content = '# ' + moment(day).format(nconf.get('fileHeader')) + '\n\n';
    fs.writeFileSync(dayFilePath, content);
  }

  return open(dayFilePath);
}

// Command for opening a specific day
function openDay(day) {
  var dayFilePath = path.join(dayDir, day + '.md');

  if (fs.existsSync(dayFilePath)) {
    return open(dayFilePath);
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

function createNote(title, options) {
  var content;
  var noteFileName;
  var noteFilePath;
  var slugTitle;

  if (!title) {
    return console.error('Must provide a title');
  }

  slugTitle = slug(title);

  // Date option allows for time stamping a note file
  if (options.date) {
    noteFileName = moment().format('YYYY-MM-DD') + '-' + slugTitle + '.md';
  } else {
    noteFileName = slugTitle + '.md';
  }

  noteFilePath = path.join(noteDir, noteFileName);

  if (!fs.existsSync(noteFilePath)) {
    content = '# ' + title + '\n\n';
    fs.writeFileSync(noteFilePath, content);
  }

  open(noteFilePath);
}

function openFolder(folder) {
  // Allow for opening the root folder if no folder is given
  if (!folder) {
    return open(onitDir);
  }

  var folders = {
    'notes': noteDir,
    'day': dayDir,
    'onit': onitDir,
    'query': queryDir
  }

  if (folders[folder]) {
    return open(folders[folder]);
  }

  return console.error('You must provide a valid folder, either notes, days, onit, or query')
}

function lastFiles(givenCount, options) {
  var content = '';
  var count = parseInt(givenCount) || 5;
  var files = fs.readdirSync(dayDir).reverse();
  var fileName;
  var filePath;

  files.slice(0, count).forEach(function (file) {
    content += fs.readFileSync(path.join(dayDir, file), 'utf8') + '\n';
  });

  if (options.save) {
    fileName = moment().format('YYYY-MM-DD') + '-' + 'last-' +count + '.md';
    filePath = path.join(queryDir, fileName)
    fs.writeFileSync(filePath, content);
    open(filePath);
  } else {
    console.log(content);
  }
}

// Utility function for saving configuration file
function saveConf(cb) {
  nconf.save(function (err) {
    if (err) {
      console.error('Error saving or creating conf file', err);
    }

    if (_.isFunction(cb)) {
      cb();
    }
  });
}
