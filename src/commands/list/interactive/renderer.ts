import getFormatter, {
    Formattable,
    getRecordFormatter,
} from '../../../format.js';
import { stdout } from 'node:process';
import Mode from './modes/index.js';
import SearchMode from './modes/search.js';
import SelectionMode from './modes/selection.js';
import { getWrappedResultText } from '../../../search.js';
import { Record } from '../../../store/index.js';
import { formattableHeader } from '../utils.js';

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
        const rows = [];

        if (mode instanceof SearchMode) {
            const searchPromptRow = `Search: ${mode.getQuery()}`;
            rows.push(searchPromptRow);
        } else {
            const emptyRow = '';
            rows.push(emptyRow);
        }

        const headerRow = this.format(formattableHeader);
        rows.push(headerRow);

        if (mode instanceof SearchMode) {
            const searchResultRows = this.getSearchResultRows(mode);
            rows.push(...searchResultRows);
        } else {
            const recordRows = this.getRecordRows(mode);
            rows.push(...recordRows);
        }

        const content = rows.join('\n');
        stdout.write(content);
    }

    private getRecordRows(mode: Mode): string[] {
        return mode.liveStore.getRecords().map((record, index) => {
            const recordText = this.formatRecord(record);
            let row = recordText;

            const inPast = record.reminder.date.getTime() - Date.now() < 0;
            let isFormatted = false;
            if (mode instanceof SelectionMode) {
                if (index === mode.index) {
                    row = `\x1B[7m${row}`;
                    isFormatted = true;
                }
            }

            if (inPast) {
                row = `\x1B[31m${row}`;
                isFormatted = true;
            }

            if (isFormatted) {
                row = `${row}\x1B[0m`;
            }

            return row;
        });
    }

    private getSearchResultRows(searchMode: SearchMode): string[] {
        return (searchMode.getResults() || []).map((result) => {
            const { item: record } = result;

            let row;
            const inPast = record.reminder.date.getTime() - Date.now() < 0;
            if (inPast) {
                row = getWrappedResultText(result, '\x1b[1m', '\x1b[22m'); // bold match
                row = `\x1B[31m${row}\x1B[0m`; // highlight red
            } else {
                row = getWrappedResultText(result, '\x1b[32m', '\x1b[0m'); // green match
            }

            return row;
        });
    }
}

export default Renderer;
