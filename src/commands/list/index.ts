import getFormatter, { getRecordFormatter } from '../../format.js';
import InteractiveList from './interactive/index.js';
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
        const interactiveList = new InteractiveList();
        interactiveList.start();
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
    const formatRecord = getRecordFormatter();
    const rows: string[] = [];
    if (options.header) {
        rows.push(format(formattableHeader));
    }
    records.forEach((record) => {
        rows.push(formatRecord(record));
    });

    console.log(rows.join('\n'));
};

export default list;
