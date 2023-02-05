#!/usr/bin/env node
import { Command } from 'commander';

import {
    complete,
    daemonStart,
    daemonStatus,
    daemonStop,
    info,
    list,
    me,
    reschedule,
} from './commands/index.js';
import setup from './setup.js';

const program = new Command();

program.name('remind').description('A natural language reminder CLI.');

program
    .command('complete')
    .description('Mark a reminder as completed.')
    .argument('[reminder...]', 'The text of the reminder.')
    .option(
        '-i, --interactive',
        '(Not implemented) Renders the reminders in interactive mode.'
    )
    .option('-s, --search', 'Renders an interactive fuzzy search prompt.')
    .action(async (reminderWords, options) => {
        const { search = false } = options;
        await setup();
        const reminderText = reminderWords.join(' ');
        await complete(reminderText, { search });
    });

const daemon = program
    .command('daemon')
    .description('Commands to control the `remindd` daemon.');

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
    .option('-h, --header', 'Show to columns headers.')
    .option('-i, --interactive', '(Not implemented) Run in interactive mode.')
    .option(
        '-l, --live',
        '(Not implemented) Same as --interactive, but the output updates regularly.'
    )
    .option('-p, --pretty', '(Not implemented) Print in a structured format.')
    .action(async (options) => {
        const { header = false } = options;
        await setup();
        await list({ header });
    });

program
    .command('me')
    .description('Create a reminder.')
    .argument(
        '<reminder...>',
        'The reminder information, including the date and time.'
    )
    .action(async (reminderWords) => {
        await setup();
        const reminderText = reminderWords.join(' ');
        await me(reminderText);
    });

program
    .command('reschedule')
    .description('Reschedule a reminder to a another time.')
    .argument(
        '<reminder...>',
        'The reminder information, including the date and time.'
    )
    .option(
        '-i, --interactive',
        '(Not implemented) Renders the reminders in interactive mode.'
    )
    .option('-s, --search', 'Renders an interactive fuzzy search prompt.')
    .action(async (reminderWords, options) => {
        const { search = false } = options;
        await setup();
        const reminderText = reminderWords.join(' ');
        await reschedule(reminderText, { search });
    });

program.parse(process.argv);