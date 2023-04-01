import remind from '@remindd/core';

import Record from 'store/record.js';
import LiveStore from '../live-store.js';
import Mode, { Key, KeypressResult, POP } from './mode.js';
import store from '../../../../store/index.js';

class AddMode implements Mode {
    liveStore: EmptyLiveStore;
    reminderText: string;

    constructor() {
        this.liveStore = new EmptyLiveStore();
        this.reminderText = '';
    }

    async keypress(data: string, key: Key): Promise<KeypressResult> {
        if (key.name === 'backspace') {
            this.reminderText = this.reminderText.slice(0, -1);
            return true;
        }

        if (key.name === 'return' || key.name === 'enter') {
            let reminder;
            try {
                reminder = remind(this.reminderText);
            } catch {
                // Invalid reminder
                return false;
            }

            await store.create(reminder);
            return POP();
        }

        this.reminderText += data;

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    update(): void {}
}

class EmptyLiveStore implements LiveStore {
    getRecords(): Record[] {
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async update() {}
}

export default AddMode;
