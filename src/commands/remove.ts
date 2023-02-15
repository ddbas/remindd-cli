import getFormatter, { FormattableRecord } from '../format.js';
import { record as recordPrompt } from '../prompts/index.js';
import makeSearcher from '../search.js';
import Store, { Record } from '../store.js';

type Options = {
    search: boolean;
};

const remove = async (searchText: string, options: Options): Promise<void> => {
    const store = new Store();
    const data = await store.getData();

    if (!data.records.length) {
        throw new Error('There are no reminders.');
    }

    const format = getFormatter();

    let record;
    if (options.search) {
        record = await recordPrompt(searchText, data.records);
        if (!record) {
            return;
        }
    } else {
        const toString = (record: Record) =>
            format(new FormattableRecord(record));
        const search = makeSearcher(data.records, toString);
        const results = search(searchText);
        if (!results.length) {
            throw new Error('No match found.');
        } else if (results.length > 1) {
            throw new Error(`${results.length} reminders were found.`);
        }

        record = results[0].record;
    }

    const index = data.records.indexOf(record);
    if (index === -1) {
        throw new Error('Unexpected state: Expected to find the reminder.');
    }

    data.records.splice(index, 1);
    await store.setData(data);

    const formattableRecord = new FormattableRecord(record);
    const recordText = format(formattableRecord);
    const output = `Reminder removed.\n${recordText}`;
    console.log(output);
};

export default remove;
