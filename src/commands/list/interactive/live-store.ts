import store, { Record } from '../../../store/index.js';

interface LiveStore {
    getRecords(): Record[];
    update(): Promise<void>;
}

class BaseLiveStore implements LiveStore {
    private records: Record[];

    constructor() {
        this.records = [];
    }

    getRecords(): Record[] {
        return this.records;
    }

    async update(): Promise<void> {
        this.records = await store.getIncomplete();
    }
}

export { BaseLiveStore };

export default LiveStore;
