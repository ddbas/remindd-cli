import { stdin, stdout } from 'node:process';
import * as readline from 'node:readline';

import getFormatter, { Formattable, FormattableRecord } from '../../format.js';
import store, { Record } from '../../store/index.js';
import { formattableHeader } from './utils.js';

const SYNC_INTERVAL = 5000;

class InteractiveList {
    format: (f: Formattable) => string;
    onExit: () => void;
    records: Record[];
    selectionIndex: number;

    constructor(records: Record[], onExit: () => void) {
        this.format = getFormatter();
        this.onExit = onExit;
        this.records = records;
        this.selectionIndex = 0;

        stdin.on('keypress', this.keypress.bind(this));
    }

    private clear() {
        stdout.cursorTo(0, 0);
        stdout.clearScreenDown();
    }

    private exit() {
        this.clear();
        this.onExit();
    }

    private async keypress(
        _: string,
        key: {
            name: string;
            ctrl: boolean;
            meta: boolean;
            shift: boolean;
        }
    ) {
        if (key.ctrl && key.name === 'c') {
            this.exit();
            return;
        }

        if (key.ctrl || key.meta || key.shift) {
            return;
        }

        if (key.name === 'q') {
            this.exit();
            return;
        }

        if (key.name === 'up') {
            const records = this.records;
            if (!records.length) {
                return;
            }

            this.selectionIndex = Math.max(this.selectionIndex - 1, 0);
            this.update();
            return;
        }

        if (key.name === 'down') {
            const records = this.records;
            if (!records.length) {
                return;
            }

            this.selectionIndex = Math.min(
                this.selectionIndex + 1,
                records.length - 1
            );
            this.update();
            return;
        }

        if (key.name === 'c') {
            const records = this.records;
            if (!records.length) {
                return;
            }

            const record = records[this.selectionIndex];
            await store.complete(record);
            this.selectionIndex = Math.max(
                Math.min(this.selectionIndex, records.length - 2),
                0
            );

            this.update();
            return;
        }

        if (key.name === 'd' || key.name === 'backspace') {
            const records = this.records;
            if (!records.length) {
                return;
            }

            const record = records[this.selectionIndex];
            await store.remove(record);
            this.selectionIndex = Math.max(
                Math.min(this.selectionIndex, records.length - 2),
                0
            );

            this.update();
            return;
        }
    }

    private render() {
        const headerRow = this.format(formattableHeader);
        const rows = this.records.map((record, index) => {
            const formattableRecord = new FormattableRecord(record);
            if (index === this.selectionIndex) {
                return `\x1B[7m${this.format(formattableRecord)}\x1B[m`;
            } else {
                return this.format(formattableRecord);
            }
        });
        const content = [headerRow, ...rows].join('\n');

        stdout.write(content);
    }

    async update() {
        const oldRecords = this.records;
        this.records = await store.getIncomplete();
        if (!oldRecords.length) {
            this.selectionIndex = 0;
            this.clear();
            this.render();
            return;
        }

        const selectionId = oldRecords[this.selectionIndex].id;
        const newSelectionIndex = this.records.findIndex(
            (record) => record.id === selectionId
        );
        if (newSelectionIndex === -1) {
            this.selectionIndex = Math.max(
                Math.min(this.selectionIndex, this.records.length - 1),
                0
            );
        } else {
            this.selectionIndex = newSelectionIndex;
        }

        this.clear();
        this.render();
    }
}

const interactive = async () => {
    if (!stdin.isTTY) {
        throw new Error('Must be run in a terminal.');
    }

    readline.emitKeypressEvents(stdin);
    stdin.setRawMode(true);

    const restore = () => {
        stdout.write('\x1B[?25h'); // Show cursor
        stdin.setRawMode(false);
        process.exit();
    };

    const records = await store.getIncomplete();
    const interactiveList = new InteractiveList(records, restore);

    stdout.write('\x1B[?25l'); // Hide cursor
    interactiveList.update();
    setInterval(interactiveList.update.bind(interactiveList), SYNC_INTERVAL);
};

export default interactive;
