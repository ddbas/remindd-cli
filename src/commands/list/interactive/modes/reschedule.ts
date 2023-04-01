import remind from '@remindd/core';

import LiveStore from '../live-store.js';
import Mode, { Key, Update } from './mode.js';
import NormalMode from './normal.js';
import store, { Record } from '../../../../store/index.js';

class RescheduleMode implements Mode {
    liveStore: LiveStore;
    dateText: string;

    constructor(record: Record) {
        this.liveStore = new SingleRecordLiveStore(record);
        this.dateText = '';
    }

    async keypress(data: string, key: Key): Promise<Update> {
        const records = this.liveStore.getRecords();
        if (!records.length) {
            return false;
        }

        if (key.name === 'backspace') {
            this.dateText = this.dateText.slice(0, -1);
            return true;
        }

        if (key.name === 'return' || key.name === 'enter') {
            const { date } = remind(this.dateText);
            const [record] = records;
            record.reminder.date = date;
            await store.update(record);
            return new NormalMode();
        }

        this.dateText += data;

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async update() {}
}

class SingleRecordLiveStore implements LiveStore {
    private id: string;
    private records: Record[];

    constructor(record: Record) {
        this.id = record.id;
        this.records = [record];
    }

    getRecords(): Record[] {
        return this.records;
    }

    async update() {
        const records = await store.getIncomplete();
        if (!records.length) {
            this.records = [];
            return;
        }

        const record = records.find((record) => record.id === this.id);
        if (!record) {
            this.records = [];
            return;
        }

        this.records = [record];
    }
}
export default RescheduleMode;
