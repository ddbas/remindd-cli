import getFormatter, { FormattableRecord } from '../../format.js';
import interactive from './interactive/index.js';
import store from '../../store/index.js';
import { formattableHeader } from './utils.js';

type Options = {
    all: boolean;
    completed: boolean;
    header: boolean;
    interactive: boolean;
};

const list = async (options: Options): Promise<void> => {
    if (options.interactive) {
        interactive();
        return;
    }

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
    const rows: string[] = [];
    if (options.header) {
        rows.push(format(formattableHeader));
    }
    records.forEach((record) => {
        const formattableRecord = new FormattableRecord(record);
        rows.push(format(formattableRecord));
    });

    console.log(rows.join('\n'));
};

export default list;
