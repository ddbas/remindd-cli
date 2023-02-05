import remind from '@remindd/core';

import getFormatter, { FormattableRecord } from '../format.js';
import { record as recordPrompt } from '../prompts/index.js';
import makeSearcher from '../search.js';
import Store, { Record } from '../store.js';

type Options = {
    search: boolean;
};

const reschedule = async (text: string, options: Options): Promise<void> => {
    const { date, title: searchText } = remind(text);
    const store = new Store();
    const data = await store.getData();

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

    record.reminder.date = date;
    await store.setData(data);

    const formattableRecord = new FormattableRecord(record);
    const recordText = format(formattableRecord);
    const output = `Reminder rescheduled.\n${recordText}`;
    console.log(output);
};

export default reschedule;
