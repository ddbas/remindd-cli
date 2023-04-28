import { stdout } from 'node:process';

import getFormatter, {
    Formattable,
    getRecordFormatter,
} from '../../../format.js';
import Mode, {
    AddMode,
    NormalMode,
    RescheduleMode,
    SearchMode,
    SelectionMode,
} from './modes/index.js';
import { getWrappedResultText } from '../../../search.js';
import { Record } from '../../../store/index.js';
import { formattableHeader } from '../utils.js';
import { StatusLevel } from './modes/mode.js';
import { UPDATE_INTERVAL } from './live-store/index.js';

type Rows = string[];

const isInPast = (record: Record) =>
    record.reminder.date.getTime() - Date.now() < 0;

class Renderer {
    private format: (f: Formattable) => string;
    private formatRecord: (record: Record) => string;

    constructor() {
        this.format = getFormatter();
        this.formatRecord = getRecordFormatter();
    }

    clear() {
        stdout.cursorTo(0, 0);
        stdout.clearScreenDown();
    }

    render(mode: Mode) {
        let rows: Rows = [];
        if (mode instanceof AddMode) {
            rows = this.getAddModeRows(mode);
        } else if (mode instanceof NormalMode) {
            rows = this.getNormalModeRows(mode);
        } else if (mode instanceof RescheduleMode) {
            rows = this.getRescheduleModeRows(mode);
        } else if (mode instanceof SelectionMode) {
            rows = this.getSelectionModeRows(mode);
        } else if (mode instanceof SearchMode) {
            rows = this.getSearchModeRows(mode);
        }

        let modeStatus = '';
        const status = mode.getStatus();
        if (status) {
            modeStatus = status.text;
            if (status.level === StatusLevel.ERROR) {
                modeStatus = `\x1B[31m${modeStatus}\x1B[0m`;
            }
        }

        const elapsed = Date.now() - mode.liveStoreView.getLastUpdate();
        const nextUpdate = Math.max(
            Math.ceil((UPDATE_INTERVAL - elapsed) / 1000),
            0
        );
        const statusRow = `(${nextUpdate}) ${modeStatus}`;
        stdout.write([statusRow, ...rows].join('\n'));
    }

    private getAddModeRows(mode: AddMode): Rows {
        const promptRow = `Remind me: ${mode.reminderText}`;
        return [promptRow];
    }

    private getNormalModeRows(mode: NormalMode): Rows {
        const recordRows = mode.liveStoreView.getRecords().map((record) => {
            const row = this.formatRecord(record);

            if (isInPast(record)) {
                return `\x1B[31m${row}\x1B[0m`;
            }

            return row;
        });

        const header = this.format(formattableHeader);
        return [header, ...recordRows];
    }

    private getRescheduleModeRows(mode: RescheduleMode): Rows {
        const records = mode.liveStoreView.getRecords();
        if (!records.length) {
            return [];
        }

        const promptRow = `When: ${mode.dateText}`;
        return [promptRow];
    }

    private getSearchModeRows(mode: SearchMode): Rows {
        // TODO: Show cursor
        const promptRow = `Search: ${mode.getQuery()}`;

        const resultRows = mode.getResults().map((result) => {
            const { item: record } = result;
            if (isInPast(record)) {
                const row = getWrappedResultText(result, '\x1b[1m', '\x1b[22m'); // bold match
                return `\x1B[31m${row}\x1B[0m`; // highlight red
            }

            return getWrappedResultText(result, '\x1b[32m', '\x1b[0m'); // green match
        });

        const resultsHeaderRow = this.format(formattableHeader);
        return [promptRow, resultsHeaderRow, ...resultRows];
    }

    private getSelectionModeRows(mode: SelectionMode): Rows {
        const selectedRecord = mode.getRecord();
        const recordRows = mode.liveStoreView.getRecords().map((record) => {
            const selected =
                !!selectedRecord && record.id === selectedRecord.id;
            const inPast = isInPast(record);
            let row = this.formatRecord(record);
            if (selected) {
                row = `\x1B[7m${row}`;
            }

            if (inPast) {
                row = `\x1B[31m${row}`;
            }

            if (selected || inPast) {
                row = `${row}\x1B[0m`;
            }

            return row;
        });

        const recordsHeaderRow = this.format(formattableHeader);
        return [recordsHeaderRow, ...recordRows];
    }
}

export default Renderer;
