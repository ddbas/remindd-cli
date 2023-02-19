import getFormatter, { FormattableRecord } from '../format.js';
import store from '../store/index.js';

type Options = {
    completed: boolean;
    header: boolean;
};

const list = async (options: Options): Promise<void> => {
    let records;
    if (options.completed) {
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
        const formattableHeader = {
            i() {
                return 'id';
            },
            d() {
                return 'date';
            },
            t() {
                return 'title';
            },
        };
        rows.push(format(formattableHeader));
    }
    records.forEach((record) => {
        const formattableRecord = new FormattableRecord(record);
        rows.push(format(formattableRecord));
    });

    console.log(rows.join('\n'));
};

export default list;
