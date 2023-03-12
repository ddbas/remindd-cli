import { stdin, stdout } from 'node:process';
import * as readline from 'node:readline';

import getFormatter, { Formattable, FormattableRecord } from '../../format.js';
import store, { Record } from '../../store/index.js';
import { formattableHeader } from './utils.js';

const SYNC_INTERVAL = 5000;

enum ModeType {
    Normal,
    Reschedule,
    Search,
    Selection,
}

interface Mode {
    readonly type: ModeType;
}

class NormalMode implements Mode {
    readonly type = ModeType.Normal;
}

class RescheduleMode implements Mode {
    readonly type = ModeType.Reschedule;
    dateText = '';
}

class SearchMode implements Mode {
    readonly type = ModeType.Search;
    query = '';
}

class SelectionMode implements Mode {
    readonly type = ModeType.Selection;
    index = 0;
}

class InteractiveList {
    format: (f: Formattable) => string;
    mode: Mode;
    onExit: () => void;
    records: Record[];

    constructor(records: Record[], onExit: () => void) {
        this.format = getFormatter();
        this.mode = new NormalMode();
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

        if (key.meta && key.name === 'escape') {
            this.mode = new NormalMode();
            this.update();
            return;
        }

        if (key.ctrl || key.meta || key.shift) {
            return;
        }

        if (key.name === 'q') {
            this.exit();
            return;
        }

        if (this.mode.type === ModeType.Normal) {
            if (key.name === 'up' || key.name === 'down') {
                const records = this.records;
                if (!records.length) {
                    return;
                }

                this.mode = new SelectionMode();
                this.update();
                return;
            }
        }

        if (this.mode.type === ModeType.Selection) {
            const selectionMode = this.mode as SelectionMode;
            if (key.name === 'up') {
                selectionMode.index = Math.max(selectionMode.index - 1, 0);
                this.update();
                return;
            }

            if (key.name === 'down') {
                const records = this.records;
                selectionMode.index = Math.min(
                    selectionMode.index + 1,
                    records.length - 1
                );
                this.update();
                return;
            }

            if (key.name === 'c') {
                const records = this.records;
                const record = records[selectionMode.index];
                await store.complete(record);
                selectionMode.index = Math.max(
                    Math.min(selectionMode.index, records.length - 2),
                    0
                );

                this.update();
                return;
            }

            if (key.name === 'd' || key.name === 'backspace') {
                const records = this.records;
                const record = records[selectionMode.index];
                await store.remove(record);
                selectionMode.index = Math.max(
                    Math.min(selectionMode.index, records.length - 2),
                    0
                );

                this.update();
                return;
            }
        }
    }

    private render() {
        const headerRow = this.format(formattableHeader);
        const rows = this.records.map((record, index) => {
            const formattableRecord = new FormattableRecord(record);
            const formattedRecord = this.format(formattableRecord);
            const inPast = record.reminder.date.getTime() - Date.now() < 0;
            if (this.mode.type === ModeType.Selection) {
                const selectionMode = this.mode as SelectionMode;
                if (index === selectionMode.index) {
                    if (inPast) {
                        return `\x1B[31m\x1B[7m${formattedRecord}\x1B[0m`;
                    }

                    return `\x1B[7m${formattedRecord}\x1B[0m`;
                }
            }

            if (inPast) {
                return `\x1B[31m${formattedRecord}\x1B[0m`;
            }

            return formattedRecord;
        });
        const content = [headerRow, ...rows].join('\n');

        stdout.write(content);
    }

    async update() {
        const oldRecords = this.records;
        this.records = await store.getIncomplete();
        if (!oldRecords.length) {
            this.mode = new NormalMode();
            this.clear();
            this.render();
            return;
        }

        if (this.mode.type === ModeType.Selection) {
            const selectionMode = this.mode as SelectionMode;
            const selectionId = oldRecords[selectionMode.index].id;
            const newSelectionIndex = this.records.findIndex(
                (record) => record.id === selectionId
            );
            if (newSelectionIndex === -1) {
                selectionMode.index = Math.max(
                    Math.min(selectionMode.index, this.records.length - 1),
                    0
                );
            } else {
                selectionMode.index = newSelectionIndex;
            }
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
