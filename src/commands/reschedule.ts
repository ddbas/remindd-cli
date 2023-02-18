import remind from '@remindd/core';

import getFormatter, { FormattableRecord } from '../format.js';
import { record as recordPrompt } from '../prompts/index.js';
import makeSearcher from '../search.js';
import store, { Record } from '../store/index.js';

type Options = {
    search: boolean;
};

const reschedule = async (text: string, options: Options): Promise<void> => {
    const { date, title: searchText } = remind(text);
    const records = await store.getIncomplete();

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

    record.reminder.date = date;
    await store.update(record);

    const formattableRecord = new FormattableRecord(record);
    const recordText = format(formattableRecord);
    const output = `Reminder rescheduled.\n${recordText}`;
    console.log(output);
};

export default reschedule;
