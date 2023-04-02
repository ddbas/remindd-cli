import store, { Record } from '../../../../store/index.js';

const UPDATE_INTERVAL = 5000;

class LiveStore {
    lastUpdate: number;
    records: Record[];

    private updateTimeoutId?: NodeJS.Timeout;

    constructor() {
        this.records = [];

        this.lastUpdate = Date.now() - UPDATE_INTERVAL;
        this.update();
    }

    async update(): Promise<void> {
        clearTimeout(this.updateTimeoutId); // in case update wasn't triggered by timeout.

        this.records = await store.getIncomplete();

        this.lastUpdate = Date.now();
        this.updateTimeoutId = setTimeout(
            this.update.bind(this),
            UPDATE_INTERVAL
        );
    }
}

export { UPDATE_INTERVAL };

export default LiveStore;
