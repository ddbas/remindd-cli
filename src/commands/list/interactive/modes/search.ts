import { getRecordFormatter } from '../../../../format.js';
import { LiveStoreView } from '../live-store/index.js';
import Mode, { Key, KeypressResult, REPLACE, Status } from './mode.js';
import makeSearcher, { SearchResult } from '../../../../search.js';
import { Record } from '../../../../store/index.js';
import SelectionMode from './selection.js';

class SearchMode implements Mode {
    liveStoreView: LiveStoreView;

    constructor(liveStoreView: LiveStoreView) {
        this.liveStoreView = new FilteredLiveStoreView(liveStoreView);
    }

    getStatus(): Status | undefined {
        return;
    }

    async keypress(data: string, key: Key): Promise<KeypressResult> {
        const liveStoreView = this.liveStoreView as FilteredLiveStoreView;
        if (key.name === 'backspace') {
            liveStoreView.query = liveStoreView.query.slice(0, -1);
            return true;
        }

        if (key.name === 'return' || key.name === 'enter') {
            return REPLACE(new SelectionMode(this.liveStoreView));
        }

        liveStoreView.query += data;

        return true;
    }

    getQuery(): string {
        const liveStoreView = this.liveStoreView as FilteredLiveStoreView;
        return liveStoreView.query;
    }

    getResults(): SearchResult<Record>[] {
        const liveStoreView = this.liveStoreView as FilteredLiveStoreView;
        return liveStoreView.getResults();
    }
}

class FilteredLiveStoreView implements LiveStoreView {
    private liveStoreView: LiveStoreView;
    private format: (record: Record) => string;
    query: string;

    constructor(liveStoreView: LiveStoreView) {
        this.format = getRecordFormatter();
        this.liveStoreView = liveStoreView;
        this.query = '';
    }

    getLastUpdate(): number {
        return this.liveStoreView.getLastUpdate();
    }

    getRecords(): Record[] {
        const results = this.getResults();
        return results.map((result) => result.item);
    }

    getResults(): SearchResult<Record>[] {
        const records = this.liveStoreView.getRecords();
        const search = makeSearcher(records, this.format);
        const results = search(this.query);
        return results;
    }
}

export default SearchMode;
