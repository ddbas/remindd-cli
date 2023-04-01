import AddMode from './add.js';
import LiveStore from '../live-store.js';
import Mode, { Key, KeypressResult, PUSH, REPLACE } from './mode.js';
import RescheduleMode from './reschedule.js';
import SearchMode from './search.js';
import store, { Record } from '../../../../store/index.js';

class SelectionMode implements Mode {
    liveStore: LiveStore;
    index: number;

    constructor(liveStore: LiveStore) {
        this.liveStore = liveStore;
        this.index = 0;
    }

    async keypress(data: string, key: Key): Promise<KeypressResult> {
        if (key.ctrl || key.meta || key.shift) {
            return false;
        }

        if (data === '/') {
            return REPLACE(new SearchMode());
        }

        if (data === 'a') {
            return PUSH(new AddMode());
        }

        const records = this.liveStore.getRecords();
        if (!records.length) {
            return false;
        }

        if (key.name === 'up') {
            this.index = Math.max(this.index - 1, 0);
            return true;
        }

        if (key.name === 'down') {
            this.index = Math.min(this.index + 1, records.length - 1);
            return true;
        }

        if (key.name === 'c') {
            const record = records[this.index];
            await store.complete(record);
            this.index = Math.max(Math.min(this.index, records.length - 2), 0);
            return true;
        }

        if (key.name === 'd' || key.name === 'backspace') {
            const record = records[this.index];
            await store.remove(record);
            this.index = Math.max(Math.min(this.index, records.length - 2), 0);

            return true;
        }

        if (key.name === 'r') {
            const record = records[this.index];
            return PUSH(new RescheduleMode(record));
        }

        return false;
    }

    async update(oldRecords: Record[]): Promise<Mode | undefined> {
        const records = this.liveStore.getRecords();
        if (!records.length || !oldRecords.length) {
            this.index = 0;
            return;
        }

        const selectionId = oldRecords[this.index].id;
        const newSelectionIndex = records.findIndex(
            (record) => record.id === selectionId
        );
        if (newSelectionIndex === -1) {
            this.index = Math.max(Math.min(this.index, records.length - 1), 0);
        } else {
            this.index = newSelectionIndex;
        }
    }
}

export default SelectionMode;
