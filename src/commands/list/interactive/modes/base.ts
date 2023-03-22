import store, { Record } from '../../../../store/index.js';
import { Key, KeypressResult, UpdateResult } from './mode.js';
import NormalMode from './normal.js';

class BaseMode {
    records: Record[];

    constructor(records: Record[]) {
        this.records = records;
    }

    async keypress(_: string, key: Key): Promise<KeypressResult | undefined> {
        if (key.meta && key.name === 'escape') {
            return { mode: new NormalMode(this), update: true };
        }

        return;
    }

    async update(): Promise<UpdateResult | undefined> {
        const oldRecords = this.records;
        this.records = await store.getIncomplete();
        if (!oldRecords.length) {
            return new NormalMode(this);
        }

        return;
    }
}

export default BaseMode;
