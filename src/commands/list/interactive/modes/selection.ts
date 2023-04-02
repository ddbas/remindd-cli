import AddMode from './add.js';
import { LiveStoreView } from '../live-store/index.js';
import Mode, { Key, KeypressResult, PUSH, REPLACE, Status } from './mode.js';
import RescheduleMode from './reschedule.js';
import SearchMode from './search.js';
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

    async keypress(data: string, key: Key): Promise<KeypressResult> {
        if (key.ctrl || key.meta || key.shift) {
            return false;
        }

        if (data === '/') {
            return REPLACE(new SearchMode(this.liveStoreView));
        }

        if (data === 'a') {
            return PUSH(new AddMode(this.liveStoreView));
        }

        const records = this.liveStoreView.getRecords();
        if (!records.length) {
            return false;
        }

        if (key.name === 'up') {
            this.selection.decrement(records);
            return true;
        }

        if (key.name === 'down') {
            this.selection.increment(records);
            return true;
        }

        if (key.name === 'c') {
            const record = this.selection.getRecord(records);
            if (record) {
                await store.complete(record);
            }

            return true;
        }

        if (key.name === 'd' || key.name === 'backspace') {
            const record = this.selection.getRecord(records);
            if (record) {
                await store.remove(record);
            }

            return true;
        }

        if (key.name === 'r') {
            const record = this.selection.getRecord(records);
            if (record) {
                return PUSH(new RescheduleMode(this.liveStoreView, record));
            }
        }

        return false;
    }

    getIndex(): number {
        const records = this.liveStoreView.getRecords();
        return this.selection.getIndex(records);
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
