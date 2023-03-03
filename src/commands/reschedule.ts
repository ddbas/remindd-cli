import remind from '@remindd/core';

import execute from '../execute.js';
import getFormatter, { FormattableRecord } from '../format.js';
import { record as recordPrompt } from '../prompts/index.js';
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
    if (options.search) {
        record = await recordPrompt(query, records);
        if (!record) {
            return;
        }
    } else if (options.executeCommand) {
        record = await execute(options.executeCommand, records);
        if (!record) {
            return;
        }
    } else {
        if (!query) {
            throw new Error('No query provided.');
        }

        const search = makeSearcher(records);
        const results = search(query);
        if (!results.length) {
            throw new Error('No match found.');
        } else if (results.length > 1) {
            throw new Error(`${results.length} reminders were found.`);
        }

        record = results[0].record;
    }

    record.reminder.date = date;
    await store.update(record);

    const format = getFormatter();
    const formattableRecord = new FormattableRecord(record);
    const recordText = format(formattableRecord);
    const output = `Reminder rescheduled.\n${recordText}`;
    console.log(output);
};

export default reschedule;
