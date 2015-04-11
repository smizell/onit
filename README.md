# Onit

Onit allows you to build daily Markdown files and create note files, all stored in one place. Onit exists to allow you to keep your daily todos in Markdown without having to manage the files to make that happen.

1. [Overview](#overview)
1. [Install](#install)
1. [Usage](#usage)

## Overview

Let's walk through how you would use Onit over a couple of days. Once you've [installed](#install) Onit, you'll need to [initialize](#init) the Onit directory, which is a directory named `onit` stored in your home directory. After you've done this, you can start using Onit to keep track of your daily tasks and notes.

Let's start our first day.

```bash
onit new
```

This create a file in the `days` folder in the Onit directory with today's date as the filename. It adds a heading to file (unless I don't want that) and saves the file. It then opens this file in the editor in which I've associated Markdown. Let's add my tasks for the day to end up with a file that looks something like this.

```markdown
# Thursday Apr.09.2015

- [ ] Go for a walk
- [ ] Pickup milk
- [ ] Plan my trip
```

Throughout the day, I can view and update my log by typing `onit today` or `onit t` in my command line. Let's say I finally get to start my task for planning a trip and I'd like to write down some notes for that. I can run a command like such `onit note "Upcoming Trip"`, which would create a file in my `notes` directory. I can type that command any time I'd like and open that same file. Interestingly, this would allow me to have a "Someday" file.

We'll say I my file for the day looked something like this.

```markdown
# Thursday Apr.09.2015

- [x] Go for a walk
- [x] Pickup milk
- [x] Plan my trip
```

After a hard day of work, I finally head to bed and get a good night of sleep. I wake up and grab a talk glass of the milk I picked up the day before. I head over to my computer and start the day just like yesterday with `onit new`. This creates a new file for the day, tells Onit that today is today and yesterday was the previous today, and opens my new file. Now I can plan my day.

```markdown
# Friday Apr.10.2015

- [ ] Mow the lawn
- [ ] Drink milk
- [ ] Take a nap
```

I'm probably working with others throughout the week, and I may want to let them know what I did yesterday and what I'll be doing today, I can run the `onit log` command anytime and it will print today and yesterday's files to my terminal and copy that to my clipboard. If asked, I can also quickly see what yesterday looked like by typing `onit yesterday`.

Maybe after a hard week of days like these I want to see what all I did. For that, you can run `onit last 5` and get the last five daily entries. This is nice for keeping up with how quickly time flies by.

Onit can do more than this, but not that much more. There are some flags for some of these commands along with some aliases, all of which can be found with `onit --help`.

## Install

Install Onit globally so you can use it on your command line.

```bash
npm install onit -g
```

## Usage

### Init

To create the needed directories and config file, initialize Onit.

```bash
onit init
```

This will create an `onit` folder in your home directory. There you will find all of the daily files along with the `config.json`, where some defaults may be changed.

### New Day

Start a new day with Onit.

```bash
onit new
```

or

```bash
onit n
```

This creates a new file and stores the previous `today` file to `yesterday`. Today is tomorrow's yesterday.

#### Flags

* To overwrite an existing file, use the `-o, --overwrite` flag
* To create an empty file, use `-e, --empty` (Onit adds a header with the day's date by default)
* To copy yesterday's content, use the `-c, --copy` flag

### Open Today's File

```bash
onit today
```

or

```bash
onit t
```

### Open Yesterday's File

```bash
onit yesterday
```

or

```bash
onit y
```

### Open File for Given Date

To look what you did on a given date, give the date to Onit.

```bash
onit open 2015-04-04
```

or

```bash
onit o 2015-04-04
```

### Print a Log of Today and Yesterday

To print what you did yesterday and what you're doing today, ask Onit to print a log. It will also copy the log to your clipboard.

```bash
onit log
```

or

```bash
onit l
```

### Notes

Onit can create notes. They are stored in the `onit/notes` folder.

```bash
onit note Thoughts
```

or

```bash
onit note "More Thoughts"
```

If a file exists with that title, it will be opened up for editing. Otherwise it is created.

If you want to prepend the file name with a date, use the `-d, --date` flag.

```bash
onit note "Thoughts for Today" -d
```

This creates a file named `onit/notes/2015-04-08-Thoughts-for-Today.md`.

### Open Folders

Onit can open Onit-specific folders for you. You can either open the `notes` or `day` directory.

```bash
onit folder notes
```

or

```
onit f notes
```

## License

Licensed under MIT license. See [LICENSE](./LICENSE) file.
