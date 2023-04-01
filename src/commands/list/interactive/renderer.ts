import getFormatter, {
    Formattable,
    getRecordFormatter,
} from '../../../format.js';
import { stdout } from 'node:process';
import Mode, {
    NormalMode,
    RescheduleMode,
    SearchMode,
    SelectionMode,
} from './modes/index.js';
import { getWrappedResultText } from '../../../search.js';
import { Record } from '../../../store/index.js';
import { formattableHeader } from '../utils.js';

interface Rows {
    header?: string;
    content: string[];
}

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
        let rows: Rows = { content: [] };
        if (mode instanceof NormalMode) {
            rows = this.getNormalModeRows(mode);
        } else if (mode instanceof RescheduleMode) {
            rows = this.getRescheduleModeRows(mode);
        } else if (mode instanceof SelectionMode) {
            rows = this.getSelectionModeRows(mode);
        } else if (mode instanceof SearchMode) {
            rows = this.getSearchModeRows(mode);
        }

        const { header = '', content } = rows;
        stdout.write([header, ...content].join('\n'));
    }

    private getNormalModeRows(mode: NormalMode): Rows {
        const recordRows = mode.liveStore.getRecords().map((record) => {
            const row = this.formatRecord(record);

            if (isInPast(record)) {
                return `\x1B[31m${row}\x1B[0m`;
            }

            return row;
        });

        const headerRow = this.format(formattableHeader);
        return { content: [headerRow, ...recordRows] };
    }

    private getRescheduleModeRows(mode: RescheduleMode): Rows {
        const records = mode.liveStore.getRecords();
        if (!records.length) {
            const header = 'No record to reschedule.';
            return { header, content: [] };
        }

        const format = getRecordFormatter('%t');
        const [record] = records;
        const header = `Reschedule '${format(record).trimEnd()}'`;
        const content = [`When: ${mode.dateText}`];

        return { header, content };
    }

    private getSelectionModeRows(mode: SelectionMode): Rows {
        const recordRows = mode.liveStore.getRecords().map((record, index) => {
            const selected = index === mode.index;
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

        const headerRow = this.format(formattableHeader);
        return { content: [headerRow, ...recordRows] };
    }

    private getSearchModeRows(mode: SearchMode): Rows {
        // TODO: Show cursor
        const header = `Search: ${mode.getQuery()}`;

        const resultRows = mode.getResults().map((result) => {
            const { item: record } = result;
            if (isInPast(record)) {
                const row = getWrappedResultText(result, '\x1b[1m', '\x1b[22m'); // bold match
                return `\x1B[31m${row}\x1B[0m`; // highlight red
            }

            return getWrappedResultText(result, '\x1b[32m', '\x1b[0m'); // green match
        });

        const headerRow = this.format(formattableHeader);
        return { header, content: [headerRow, ...resultRows] };
    }
}

export default Renderer;
