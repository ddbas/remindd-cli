# `@remindd/cli`

A natural language reminder CLI.

## Install

```sh
npm install -g @remindd/cli
```

## Usage

```
Usage: remind [options] [command]

A natural language reminder CLI.

Options:
  -v, --version                       output the version number
  -h, --help                          display help for command

Commands:
  complete [options] [query...]       Complete a reminder.
  daemon                              `remindd` daemon.
  info                                Prints information about the current installation.
  list [options]                      List the reminders.
  me <reminder...>                    Create a reminder.
  remove [options] [query...]         Remove a reminder.
  reschedule [options] <reminder...>  Reschedule a reminder.
  help [command]                      display help for command
```

## Create a reminder

The `remind me` command.

```sh
remind me to make supper at 5 PM
# d446c90a  05/17/23 17:00  make supper
```

Run `remind me --help` for more details.

## List the reminders

The `remind list` command.

```sh
remind list
# d446c90a  05/17/23 17:00  make supper
# b65b44a9  05/19/23 13:30  dentist appointment
```

Run `remind list --help` for more details.

## Reschedule a reminder

The `remind reschedule` command.

```sh
remind reschedule make supper tomorrow at 5 PM
# Reminder rescheduled.
# d446c90a  05/18/23 17:00  make supper
```

Run `remind reschedule --help` for more details.

## Complete a reminder

The `remind complete` command.

```sh
remind complete make supper
# Reminder completed.
# d446c90a  05/17/23 17:00  make supper
```

Run `remind complete --help` for more details.

## Remove a reminder

The `remind remove` command.

```sh
remind remove make supper
# Reminder removed.
# d446c90a  05/17/23 17:00  make supper
```
