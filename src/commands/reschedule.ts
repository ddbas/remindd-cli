import remind from '@remindd/core';

import execute from '../execute.js';
import { getRecordFormatter } from '../format.js';
import prompt from '../prompt/index.js';
import makeSearcher from '../search.js';
import store from '../store/index.js';

type Options = {
    executeCommand?: string;
    search: boolean;
};

const reschedule = async (
    reminderText: string,
    options: Options
): Promise<void> => {
    const { date, title: query } = remind(reminderText);
    const records = await store.getIncomplete();

    let record;
    let recordText;
    const format = getRecordFormatter();
    if (options.search) {
        record = await prompt(query, records);
        if (!record) {
            return;
        }

        recordText = format(record);
    } else if (options.executeCommand) {
        record = await execute(options.executeCommand, records);
        if (!record) {
            return;
        }

        recordText = format(record);
    } else {
        if (!query) {
            throw new Error('No query provided.');
        }

        const search = makeSearcher(records, format);
        const results = search(query);
        if (!results.length) {
            throw new Error('No match found.');
        } else if (results.length > 1) {
            throw new Error(`${results.length} reminders were found.`);
        }

        const result = results[0];
        record = result.item;
        recordText = result.text;
    }

    record.reminder.date = date;
    await store.update(record);

    const output = `Reminder rescheduled.\n${recordText}`;
    console.log(output);
};

export default reschedule;
