import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Reminder } from '@remindd/core';

import constants from './constants.js';

const FILE_NAME = 'reminders.json';

type Schema = {
    reminders: {
        id: string;
        date: string;
        title: string;
    }[];
};

type Record = {
    id: string;
    reminder: Reminder;
};

type StoreData = {
    records: Record[];
};

class Store {
    path: string;

    constructor() {
        if (process.env.XDG_DATA_HOME) {
            this.path = path.join(
                process.env.XDG_DATA_HOME,
                constants.APP_NAME,
                FILE_NAME
            );
        } else {
            const homedir = os.homedir();
            this.path = path.join(
                homedir,
                '.local',
                'share',
                constants.APP_NAME,
                FILE_NAME
            );
        }
    }

    async getData(): Promise<StoreData> {
        let contentString;
        try {
            contentString = await fs.readFile(this.path, { encoding: 'utf8' });
        } catch {
            throw new Error('Failed to read the store.');
        }

        let content: Schema;
        try {
            content = JSON.parse(contentString);
        } catch {
            throw new Error('The store is corrupted.');
        }

        const records = (content.reminders || [])
            .map((reminder) => ({
                id: reminder.id,
                reminder: {
                    date: new Date(reminder.date),
                    title: reminder.title,
                },
            }))
            .sort((record, otherRecord) => {
                return (
                    record.reminder.date.getTime() -
                    otherRecord.reminder.date.getTime()
                );
            });
        return {
            records,
        };
    }

    async setData(data: StoreData): Promise<void> {
        const reminders = data.records.map((record) => ({
            id: record.id,
            title: record.reminder.title,
            date: record.reminder.date.toJSON(),
        }));
        const content: Schema = {
            reminders,
        };

        try {
            await fs.writeFile(
                this.path,
                JSON.stringify(content, undefined, 2),
                { encoding: 'utf8' }
            );
        } catch {
            throw new Error('Failed to write to the store.');
        }
    }
}

export { Record };

export default Store;
