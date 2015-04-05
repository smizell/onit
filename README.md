# Onit

Build daily whatever files in Markdown.

## Install

Install Onit globally

```shell
npm install onit -g
```

## Usage

### Init

To create the needed directories, initialize Onit.

```shell
onit init
```

This will create an `onit` folder in your home directory. There you will find all of the daily files along with the `config.json`, where some defaults may be changed.

### New Day

Start a new day with Onit.

```shell
onit new
```

or

```shell
onit n
```

This creates a new file and stores the previous `today` file to `yesterday`. Today is tomorrow's yesterday.

If you want to overwrite an existing file, use the `-o, --overwrite` flag, or if you want to create an empty file, use `-e, --empty`.

### Open Today's File

```shell
onit today
```

or

```shell
onit t
```

### Open Yesterday's File

```shell
onit yesterday
```

or

```shell
onit y
```

### Open File for Given Date

To look what you did on a given date, give the date to Onit.

```shell
onit open 2015-04-04
```

or

```shell
onit o 2015-04-04
```

### Print a Log of Today and Yesterday

To print what you did yesterday and what you're doing today, ask Onit to print a log. It will also copy the log to your clipboard.

```shell
onit log
```

or

```shell
onit l
```

### Create Gist from Today

Onit can create a Gist from today's file.

```shell
onit gist
```

or

```shell
onit g
```

### Update Yesterday from Gist

Onit can update yesterday's file from a Gist URL.

```shell
onit yesterday_gist https://gist.github.com/user/9898ea893bc989
```

or

```shell
onit yg https://gist.github.com/user/9898ea893bc989
```

## License

Licensed under MIT license. See [LICENSE](./LICENSE) file.
