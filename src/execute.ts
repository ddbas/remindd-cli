import childProcess from 'node:child_process';

import { getRecordFormatter } from './format.js';
import { Record as StoreRecord } from './store/index.js';

const execute = (
    command: string,
    records: StoreRecord[]
): Promise<StoreRecord | undefined> => {
    // Generate remind list text
    const format = getRecordFormatter();
    const rowToRecord: Record<string, StoreRecord> = {};
    const reminderListOutput =
        records
            .map((record) => {
                const row = format(record);
                rowToRecord[row] = record;
                return row;
            })
            .join('\n') + '\n';

    // Execute command
    const child = childProcess.spawn(command, {
        shell: true,
        stdio: ['pipe', 'pipe', 'inherit'],
    });
    child.stdin.write(reminderListOutput);
    child.stdin.end();
    return new Promise((resolve) => {
        child.stdout.on('data', (data) => {
            const output = data.toString().replace(/\r?\n/g, '');
            const record = rowToRecord[output];
            if (record) {
                resolve(record);
            }

            const row = Object.keys(rowToRecord).find((row) =>
                row.includes(output)
            );
            if (row) {
                return rowToRecord[row];
            }

            throw new Error(
                `No reminder was found matching the output:\n\n${data.toString()}`
            );
        });
        child.on('error', (error) => {
            throw new Error(`The command failed: "${error.message}"`);
        });
        child.on('close', () => {
            resolve(undefined);
        });
    });
};

export default execute;
