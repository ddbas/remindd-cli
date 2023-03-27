import execute from '../execute.js';
import { getRecordFormatter } from '../format.js';
import { record as recordPrompt } from '../prompts/index.js';
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
    let recordText;
    const format = getRecordFormatter();
    if (options.search) {
        record = await recordPrompt(query || '', records);
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

    await store.complete(record);

    const output = `Reminder completed.\n${recordText}`;
    console.log(output);
};

export default complete;
