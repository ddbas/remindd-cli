import BaseMode from './base.js';
import { getRecordFormatter } from '../../../../format.js';
import Mode, { Key, KeypressResult, UpdateResult } from './mode.js';
import makeSearcher, { SearchResult } from '../../../../search.js';
import { Record } from '../../../../store/index.js';
import SelectionMode from './selection.js';

class SearchMode implements Mode {
    base: BaseMode;
    private format: (record: Record) => string;
    query: string;
    results: SearchResult<Record>[] | undefined;

    constructor(base: BaseMode) {
        this.base = base;
        this.format = getRecordFormatter();
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

        if (key.name === 'backspace') {
            this.query = this.query.slice(0, -1);
            return { update: true };
        }

        if (key.name === 'return' || key.name === 'enter') {
            return { mode: new SelectionMode(this.base), update: true };
        }

        this.query += data;

        return { update: true };
    }

    async update(): Promise<UpdateResult | undefined> {
        const result = await this.base.update();
        if (result) {
            return result;
        }

        const search = makeSearcher(this.base.records, this.format);
        this.results = search(this.query);
    }
}

export default SearchMode;
