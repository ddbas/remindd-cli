import execute from '../execute.js';
import getFormatter, { FormattableRecord } from '../format.js';
import prompt from '../prompt/index.js';
import makeSearcher from '../search.js';
import store from '../store/index.js';

type Options = {
    executeCommand?: string;
    search: boolean;
};

const complete = async (
    query: string | undefined,
    options: Options
): Promise<void> => {
    const records = await store.getIncomplete();
    if (!records.length) {
        throw new Error('There are no reminders.');
    }

    let record;
    if (options.search) {
        record = await prompt(query || '', records);
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

    await store.complete(record);

    const format = getFormatter();
    const formattableRecord = new FormattableRecord(record);
    const recordText = format(formattableRecord);
    const output = `Reminder completed.\n${recordText}`;
    console.log(output);
};

export default complete;
