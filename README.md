# Onit

Build daily whatever files in Markdown. It allows you to create a Markdown file for today, quickly open that file for updating, and moving that file to "yesterday" when a new day is created. These files can be used as a diary, daily todo list, or anything chronological.

## Install

Install Onit globally

```bash
npm install onit -g
```

## Usage

### Init

To create the needed directories, initialize Onit.

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

If you want to overwrite an existing file, use the `-o, --overwrite` flag, or if you want to create an empty file, use `-e, --empty`. The reason for the empty flag is that by default Onit adds a header with the day's date.

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

### GitHub Fun

Onit can interact with GitHub and create and copy Gists. Currently, to do this, you'll need to manually visit GitHub, go to the Settings for your accoutn, go to Applications, and generate a token for Onit. Then open up `onit/config.json` and add a `githubToken` property with the value being the token you just created.

**Note**: This section will likely change before being stable.

#### Create Gist from Today

Onit can create a Gist from today's file.

```bash
onit gist
```

or

```bash
onit g
```

#### Update Yesterday from Gist

Onit can update yesterday's file from a Gist URL.

```bash
onit yesterday_gist https://gist.github.com/user/9898ea893bc989
```

or

```bash
onit yg https://gist.github.com/user/9898ea893bc989
```

## License

Licensed under MIT license. See [LICENSE](./LICENSE) file.
