import { stdin, stdout } from 'node:process';
import * as readline from 'node:readline';

import getFormatter, { FormattableRecord } from '../../format.js';
import store, { Record } from '../../store/index.js';
import { formattableHeader } from './utils.js';

const SYNC_INTERVAL = 5000;

const interactive = () => {
    if (!stdin.isTTY) {
        throw new Error('Must be run in a terminal.');
    }

    readline.emitKeypressEvents(stdin);
    stdin.setRawMode(true);

    const clear = () => {
        stdout.cursorTo(0, 0);
        stdout.clearScreenDown();
    };

    const restore = () => {
        clear();
        stdout.write('\x1B[?25h'); // Show cursor
        stdin.setRawMode(false);
        process.exit();
    };

    stdin.on(
        'keypress',
        (
            str: string,
            key: {
                name: string;
                ctrl: boolean;
                meta: boolean;
                shift: boolean;
            }
        ) => {
            if (key.ctrl && key.name === 'c') {
                restore();
                return;
            }

            if (key.ctrl || key.meta || key.shift) {
                return;
            }

            if (key.name === 'q') {
                restore();
                return;
            }
        }
    );

    const format = getFormatter();
    const headerRow = format(formattableHeader);
    const render = (records: Record[]) => {
        const rows = records.map((record) => {
            const formattableRecord = new FormattableRecord(record);
            return format(formattableRecord);
        });
        const content = [headerRow, ...rows].join('\n');

        stdout.write(content);
    };

    const update = async () => {
        const records = await store.getIncomplete();
        clear();
        render(records);
    };

    stdout.write('\x1B[?25l'); // Hide cursor
    update();
    setInterval(update, SYNC_INTERVAL);
};

export default interactive;
