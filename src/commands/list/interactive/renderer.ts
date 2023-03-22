import getFormatter, {
    Formattable,
    FormattableRecord,
} from '../../../format.js';
import { stdout } from 'node:process';
import Mode from './modes/index.js';
import SelectionMode from './modes/selection.js';
import { formattableHeader } from '../utils.js';

class Renderer {
    private format: (f: Formattable) => string;

    constructor() {
        this.format = getFormatter();
    }

    clear() {
        stdout.cursorTo(0, 0);
        stdout.clearScreenDown();
    }

    render(mode: Mode) {
        const headerRow = this.format(formattableHeader);
        const rows = mode.base.records.map((record, index) => {
            const formattableRecord = new FormattableRecord(record);
            const formattedRecord = this.format(formattableRecord);
            let row = formattedRecord;

            const inPast = record.reminder.date.getTime() - Date.now() < 0;
            let isFormatted = false;
            if (mode instanceof SelectionMode) {
                const selectionMode = mode as SelectionMode;
                if (index === selectionMode.index) {
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

        const content = [headerRow, ...rows].join('\n');
        stdout.write(content);
    }
}

export default Renderer;
