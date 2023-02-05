import getFormatter, { FormattableRecord } from '../format.js';
import Store from '../store.js';

type Options = {
    header: boolean;
};

const list = async (options: Options): Promise<void> => {
    const store = new Store();
    const { records } = await store.getData();
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
