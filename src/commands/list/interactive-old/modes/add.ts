import remind from '@remindd/core';

import { LiveStoreView } from '../live-store/index.js';
import Mode, { Key, KeypressResult, Status } from './mode.js';
import store from '../../../../store/index.js';

class AddMode implements Mode {
    liveStoreView: LiveStoreView;
    reminderText: string;

    constructor(liveStoreView: LiveStoreView) {
        this.liveStoreView = liveStoreView;
        this.reminderText = '';
    }

    getStatus(): Status | undefined {
        return;
    }

    async keypress(
        data: string,
        key: Key
    ): Promise<KeypressResult | undefined> {
        if (key.name === 'backspace') {
            this.reminderText = this.reminderText.slice(0, -1);
            return KeypressResult.UPDATE;
        }

        if (key.name === 'return' || key.name === 'enter') {
            let reminder;
            try {
                reminder = remind(this.reminderText);
            } catch {
                // Invalid reminder
                return;
            }

            await store.create(reminder);
            return KeypressResult.SUBMIT;
        }

        this.reminderText += data;

        return KeypressResult.UPDATE;
    }
}

export default AddMode;
