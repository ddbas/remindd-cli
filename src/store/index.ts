import crypto from 'node:crypto';
import { Reminder } from '@remindd/core';

import completedDatabase from './database/completed.js';
import remindersDatabase from './database/reminders.js';
import Record from './record.js';

const complete = async (record: Record): Promise<void> => {
    const incompleteRecords = await remindersDatabase.read();
    const index = incompleteRecords.findIndex(
        (incompleteRecord) => incompleteRecord.id === record.id
    );
    if (index === -1) {
        throw new Error(`Reminder '${record.reminder.title}' does not exist.`);
    }

    const completedRecords = await completedDatabase.read();
    incompleteRecords.splice(index, 1);
    completedRecords.push(record);

    const writeRemindersPromise = remindersDatabase.write(incompleteRecords);
    const writeCompletedPromise = completedDatabase.write(completedRecords);
    await Promise.all([writeRemindersPromise, writeCompletedPromise]);
};

const create = async (reminder: Reminder): Promise<Record> => {
    const id = crypto.randomBytes(4).toString('hex');
    const record = {
        id,
        reminder,
    };

    const records = await remindersDatabase.read();
    records.push(record);
    await remindersDatabase.write(records);

    return record;
};

const remove = async (record: Record): Promise<void> => {
    const records = await remindersDatabase.read();
    const index = records.findIndex(
        (otherRecord) => otherRecord.id === record.id
    );
    if (index === -1) {
        throw new Error(`Reminder '${record.reminder.title}' does not exist.`);
    }

    records.splice(index, 1);
    await remindersDatabase.write(records);
};

const update = async (record: Record): Promise<void> => {
    const records = await remindersDatabase.read();
    const index = records.findIndex(
        (otherRecord) => otherRecord.id === record.id
    );
    if (index === -1) {
        throw new Error(`Reminder '${record.reminder.title}' does not exist.`);
    }

    records[index] = record;
    await remindersDatabase.write(records);
};

export { Record };

export default {
    complete,
    create,
    getCompleted: () => completedDatabase.read(),
    getIncomplete: () => remindersDatabase.read(),
    remove,
    update,
};
