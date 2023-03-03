#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'node:fs';

import {
    complete,
    daemonStart,
    daemonStatus,
    daemonStop,
    info,
    list,
    me,
    remove,
    reschedule,
} from './commands/index.js';

const { version } = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), {
        encoding: 'utf8',
    })
);

const program = new Command();

program
    .name('remind')
    .version(version, '-v, --version')
    .description('A natural language reminder CLI.');

program
    .command('complete')
    .description('Complete a reminder.')
    .argument(
        '[query...]',
        "A full or partial match of the reminder's title or id."
    )
    .option('-s, --search', 'Renders a fuzzy search prompt.')
    .option(
        '-e, --execute <command>',
        'A command used to search the list of reminders. The output of the command is the reminder to complete.'
    )
    .action(async (queryWords, options) => {
        const { execute: executeCommand, search = false } = options;
        const query = queryWords.length ? queryWords.join(' ') : undefined;
        await complete(query, { executeCommand, search });
    });

const daemon = program.command('daemon').description('`remindd` daemon.');

daemon
    .command('start')
    .description('Start the daemon.')
    .action(async () => {
        await daemonStart();
    });

daemon
    .command('status')
    .description('Prints status information about the daemon.')
    .action(async () => {
        await daemonStatus();
    });

daemon
    .command('stop')
    .description('Stop the daemon.')
    .action(async () => {
        await daemonStop();
    });

program
    .command('info')
    .description('Prints information about the current installation.')
    .action(async () => {
        await info();
    });

program
    .command('list')
    .description('List the reminders.')
    .option('-a, --all', 'List all reminders.')
    .option('-c, --completed', 'List the completed reminders.')
    .option('-h, --header', 'Show the column headers.')
    .option('-i, --interactive', '(Not implemented) Run in interactive mode.')
    .action(async (options) => {
        const { all = false, completed = false, header = false } = options;
        await list({ all, completed, header });
    });

program
    .command('me')
    .description('Create a reminder.')
    .argument(
        '<reminder...>',
        'The reminder information, including the date and time.'
    )
    .action(async (reminderWords) => {
        const reminderText = reminderWords.join(' ');
        await me(reminderText);
    });

program
    .command('remove')
    .description('Remove a reminder.')
    .argument(
        '[query...]',
        "A full or partial match of the reminder's title or id."
    )
    .option('-s, --search', 'Renders a fuzzy search prompt.')
    .option(
        '-e, --execute <command>',
        'A command used to search the list of reminders. The output of the command is the reminder to remove.'
    )
    .action(async (queryWords, options) => {
        const { execute: executeCommand, search = false } = options;
        const query = queryWords.length ? queryWords.join(' ') : undefined;
        await remove(query, { executeCommand, search });
    });

program
    .command('reschedule')
    .description('Reschedule a reminder.')
    .argument(
        '<reminder...>',
        "A full or partial match of the reminder's title or id, as well as the date and/or time to reschedule to."
    )
    .option('-s, --search', 'Renders a fuzzy search prompt.')
    .option(
        '-e, --execute <command>',
        'A command used to search the list of reminders. The output of the command is the reminder to reschedule. When using this option, only the date and time information in the <reminder...> argument will be used.'
    )
    .action(async (reminderWords, options) => {
        const { execute: executeCommand, search = false } = options;
        const reminderText = reminderWords.join(' ');
        await reschedule(reminderText, { executeCommand, search });
    });

program.parse(process.argv);
