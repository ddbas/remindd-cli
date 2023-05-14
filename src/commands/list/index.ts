import getFormatter, { getRecordFormatter } from '../../format.js';
import store from '../../store/index.js';
import { formattableHeader } from './utils.js';

type Options = {
    all: boolean;
    completed: boolean;
    header: boolean;
};

const list = async (options: Options): Promise<void> => {
    let records;
    if (options.all) {
        const promise = Promise.all([
            store.getIncomplete(),
            store.getCompleted(),
        ]);
        records = (await promise).flat().sort((record, otherRecord) => {
            return (
                record.reminder.date.getTime() -
                otherRecord.reminder.date.getTime()
            );
        });
    } else if (options.completed) {
        records = await store.getCompleted();
    } else {
        records = await store.getIncomplete();
    }

    if (!records.length) {
        console.log('No reminders.');
        return;
    }

    const format = getFormatter();
    const formatRecord = getRecordFormatter();
    const rows: string[] = [];
    if (options.header) {
        rows.push(format(formattableHeader));
    }

    const now = Date.now();
    records.forEach((record) => {
        const recordRow =
            record.reminder.date.getTime() < now
                ? `\x1B[31m${formatRecord(record)}\x1B[0m`
                : formatRecord(record);
        rows.push(recordRow);
    });

    console.log(rows.join('\n'));
};

export default list;
