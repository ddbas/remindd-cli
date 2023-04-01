import { getRecordFormatter } from '../../../../format.js';
import LiveStore from '../live-store.js';
import Mode, { Key, Update } from './mode.js';
import makeSearcher, { SearchResult } from '../../../../search.js';
import store, { Record } from '../../../../store/index.js';
import SelectionMode from './selection.js';

class SearchMode implements Mode {
    liveStore: LiveStore;

    constructor() {
        this.liveStore = new FilteredLiveStore();
    }

    async keypress(data: string, key: Key): Promise<Update> {
        const liveStore = this.liveStore as FilteredLiveStore;
        if (key.name === 'backspace') {
            liveStore.query = liveStore.query.slice(0, -1);
            return true;
        }

        if (key.name === 'return' || key.name === 'enter') {
            return new SelectionMode(this.liveStore);
        }

        liveStore.query += data;

        return true;
    }

    getQuery(): string {
        const liveStore = this.liveStore as FilteredLiveStore;
        return liveStore.query;
    }

    getResults(): SearchResult<Record>[] {
        const liveStore = this.liveStore as FilteredLiveStore;
        return liveStore.results;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async update() {}
}

class FilteredLiveStore implements LiveStore {
    private format: (record: Record) => string;
    query: string;
    results: SearchResult<Record>[];

    constructor() {
        this.format = getRecordFormatter();
        this.query = '';
        this.results = [];
    }

    getRecords(): Record[] {
        return this.results.map((result) => result.item);
    }

    async update() {
        const records = await store.getIncomplete();
        const search = makeSearcher(records, this.format);
        this.results = search(this.query);
    }
}

export default SearchMode;
