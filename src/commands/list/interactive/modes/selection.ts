import store from '../../../../store/index.js';
import BaseMode from './base.js';
import Mode, { Key, KeypressResult, UpdateResult } from './mode.js';
import SearchMode from './search.js';

class SelectionMode implements Mode {
    base: BaseMode;
    index: number;

    constructor(base: BaseMode) {
        this.base = base;
        this.index = 0;
    }

    async keypress(
        data: string,
        key: Key
    ): Promise<KeypressResult | undefined> {
        const result = await this.base.keypress(data, key);
        if (result) {
            return result;
        }

        if (key.ctrl || key.meta || key.shift) {
            return;
        }

        if (key.name === 'up') {
            this.index = Math.max(this.index - 1, 0);
            return { update: true };
        }

        if (key.name === 'down') {
            const records = this.base.records;
            this.index = Math.min(this.index + 1, records.length - 1);
            return { update: true };
        }

        if (key.name === 'c') {
            const records = this.base.records;
            const record = records[this.index];
            await store.complete(record);
            this.index = Math.max(Math.min(this.index, records.length - 2), 0);

            return { update: true };
        }

        if (key.name === 'd' || key.name === 'backspace') {
            const records = this.base.records;
            const record = records[this.index];
            await store.remove(record);
            this.index = Math.max(Math.min(this.index, records.length - 2), 0);

            return { update: true };
        }

        if (data === '/') {
            return { mode: new SearchMode(this.base), update: true };
        }

        return;
    }

    async update(): Promise<UpdateResult | undefined> {
        const oldRecords = this.base.records;
        const result = await this.base.update();
        if (result) {
            return result;
        }

        const selectionId = oldRecords[this.index].id;
        const newSelectionIndex = this.base.records.findIndex(
            (record) => record.id === selectionId
        );
        if (newSelectionIndex === -1) {
            this.index = Math.max(
                Math.min(this.index, this.base.records.length - 1),
                0
            );
        } else {
            this.index = newSelectionIndex;
        }
    }
}

export default SelectionMode;
