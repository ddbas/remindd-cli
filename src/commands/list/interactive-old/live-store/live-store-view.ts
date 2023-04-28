import LiveStore from './live-store.js';
import { Record } from '../../../../store/index.js';

interface LiveStoreView {
    getLastUpdate(): number;
    getRecords(): Record[];
}

class DefaultLiveStoreView implements LiveStoreView {
    private liveStore: LiveStore;

    constructor(liveStore: LiveStore) {
        this.liveStore = liveStore;
    }

    getLastUpdate(): number {
        return this.liveStore.lastUpdate;
    }

    getRecords(): Record[] {
        return this.liveStore.records;
    }
}

export { DefaultLiveStoreView };

export default LiveStoreView;
