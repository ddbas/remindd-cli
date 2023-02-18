import { makeDatabase } from './database.js';
import Record from '../record.js';

const FILE_NAME = 'completed.json';

type Schema = {
    reminders: {
        id: string;
        date: string;
        title: string;
    }[];
};

const databasePromise = makeDatabase(FILE_NAME);

const read = async (): Promise<Record[]> => {
    const database = await databasePromise;
    const { reminders = [] }: Schema = await database.read();
    const records = reminders
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
    return records;
};

const write = async (records: Record[]): Promise<void> => {
    const reminders = records.map((record) => ({
        id: record.id,
        title: record.reminder.title,
        date: record.reminder.date.toJSON(),
    }));
    const data: Schema = {
        reminders,
    };

    const database = await databasePromise;
    await database.write(data);
};

export default { read, write };
