import getFormatter, { FormattableRecord } from '../format.js';
import { record as recordPrompt } from '../prompts/index.js';
import makeSearcher from '../search.js';
import store, { Record } from '../store/index.js';

type Options = {
    search: boolean;
};

const remove = async (searchText: string, options: Options): Promise<void> => {
    const records = await store.getIncomplete();

    if (!records.length) {
        throw new Error('There are no reminders.');
    }

    const format = getFormatter();

    let record;
    if (options.search) {
        record = await recordPrompt(searchText, records);
        if (!record) {
            return;
        }
    } else {
        const toString = (record: Record) =>
            format(new FormattableRecord(record));
        const search = makeSearcher(records, toString);
        const results = search(searchText);
        if (!results.length) {
            throw new Error('No match found.');
        } else if (results.length > 1) {
            throw new Error(`${results.length} reminders were found.`);
        }

        record = results[0].record;
    }

    await store.remove(record);

    const formattableRecord = new FormattableRecord(record);
    const recordText = format(formattableRecord);
    const output = `Reminder removed.\n${recordText}`;
    console.log(output);
};

export default remove;
