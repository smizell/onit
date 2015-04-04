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

This will create an `onit` folder in your home directory.

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

To print what you did yesterday and what you're doing today, ask Onit to print a log.

```shell
onit log
```

or

```shell
onit o
```

## License

Licensed under MIT license. See [LICENSE](./License) file.
