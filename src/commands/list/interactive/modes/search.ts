import BaseMode from './base.js';
import Mode, { Key, KeypressResult, UpdateResult } from './mode.js';
import { Record } from '../../../../store/index.js';

class SearchMode implements Mode {
    base: BaseMode;
    filteredRecords: Record[] | undefined;
    query: string;

    constructor(base: BaseMode) {
        this.base = base;
        this.query = '';
    }

    async keypress(
        data: string,
        key: Key
    ): Promise<KeypressResult | undefined> {
        const result = await this.base.keypress(data, key);
        if (result) {
            return result;
        }

        return;
    }

    async update(): Promise<UpdateResult | undefined> {
        return await this.base.update();
    }
}

export default SearchMode;
