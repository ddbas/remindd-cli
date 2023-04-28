import { LiveStoreView } from '../live-store/index.js';
import Mode, { Key, KeypressResult, Status } from './mode.js';
import store, { Record } from '../../../../store/index.js';

class SelectionMode implements Mode {
    liveStoreView: LiveStoreView;
    selection: Selection;

    constructor(liveStoreView: LiveStoreView) {
        this.liveStoreView = liveStoreView;
        this.selection = new Selection();
    }

    getStatus(): Status | undefined {
        return;
    }

    async keypress(
        data: string,
        key: Key
    ): Promise<KeypressResult | undefined> {
        if (key.ctrl || key.meta || key.shift) {
            return;
        }

        if (data === '/') {
            return KeypressResult.SEARCH;
        }

        if (data === 'a') {
            return KeypressResult.ADD;
        }

        const records = this.liveStoreView.getRecords();
        if (!records.length) {
            return;
        }

        if (key.name === 'up') {
            this.selection.decrement(records);
            return KeypressResult.UPDATE;
        }

        if (key.name === 'down') {
            this.selection.increment(records);
            return KeypressResult.UPDATE;
        }

        if (key.name === 'c') {
            const record = this.selection.getRecord(records);
            if (record) {
                await store.complete(record);
            }

            return KeypressResult.UPDATE;
        }

        if (key.name === 'd' || key.name === 'backspace') {
            const record = this.selection.getRecord(records);
            if (record) {
                await store.remove(record);
            }

            return KeypressResult.UPDATE;
        }

        if (key.name === 'r') {
            const record = this.selection.getRecord(records);
            if (record) {
                return KeypressResult.RESCHEDULE;
            }
        }

        return;
    }

    getRecord(): Record | undefined {
        const records = this.liveStoreView.getRecords();
        return this.selection.getRecord(records);
    }
}

class Selection {
    private recordId?: string;
    private lastIndex = -1;

    getIndex(records: Record[]): number {
        if (!records.length) {
            return -1;
        }

        const index = this.recordId
            ? records.findIndex((record) => record.id === this.recordId)
            : -1;
        if (index === -1) {
            this.lastIndex = Math.max(
                Math.min(this.lastIndex, records.length - 1),
                0
            );
            this.recordId = records[this.lastIndex].id;
        } else {
            this.lastIndex = index;
        }

        return this.lastIndex;
    }

    getRecord(records: Record[]): Record | undefined {
        const index = this.getIndex(records);
        if (index === -1) {
            return;
        }

        return records[index];
    }

    increment(records: Record[]) {
        const index = this.getIndex(records);
        if (index === -1) {
            return;
        }

        this.lastIndex = Math.min(index + 1, records.length - 1);
        this.recordId = records[this.lastIndex].id;
    }

    decrement(records: Record[]) {
        const index = this.getIndex(records);
        if (index === -1) {
            return;
        }

        this.lastIndex = Math.max(index - 1, 0);
        this.recordId = records[this.lastIndex].id;
    }
}

export default SelectionMode;
