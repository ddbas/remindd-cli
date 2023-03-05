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
    selectionId: string | undefined; // record id

    constructor(records: Record[], onExit: () => void) {
        this.format = getFormatter();
        this.onExit = onExit;
        this.records = records;

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

    private keypress(
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
            const currentSelectionIndex = records.findIndex(
                (record) => record.id === this.selectionId
            );
            const newSelectionIndex = Math.max(currentSelectionIndex - 1, 0);
            this.selectionId = records[newSelectionIndex].id;
            this.update();
            return;
        }

        if (key.name === 'down') {
            const records = this.records;
            const currentSelectionIndex = this.selectionId
                ? records.findIndex((record) => record.id === this.selectionId)
                : 0;
            const newSelectionIndex = Math.min(
                currentSelectionIndex + 1,
                records.length - 1
            );
            this.selectionId = records[newSelectionIndex].id;
            this.update();
            return;
        }
    }

    private render() {
        const selectionIndex = this.selectionId
            ? Math.max(
                  this.records.findIndex(
                      (record) => record.id === this.selectionId
                  ),
                  0
              )
            : 0;

        const headerRow = this.format(formattableHeader);
        const rows = this.records.map((record, index) => {
            const formattableRecord = new FormattableRecord(record);
            if (index === selectionIndex) {
                return `\x1B[7m${this.format(formattableRecord)}\x1B[m`;
            } else {
                return this.format(formattableRecord);
            }
        });
        const content = [headerRow, ...rows].join('\n');

        stdout.write(content);
    }

    async update() {
        this.records = await store.getIncomplete();
        const currentSelectionIndex = this.records.findIndex(
            (record) => record.id === this.selectionId
        );
        if (currentSelectionIndex === -1) {
            this.selectionId = undefined;
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
