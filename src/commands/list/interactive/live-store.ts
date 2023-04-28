import store, { Record } from '../../../store/index.js';

type OnUpdateCallback = () => void;

class LiveStore {
    private _lastUpdate: number | undefined;
    private onUpdate: OnUpdateCallback;
    private updateInterval: number;
    private updateTimeoutId?: NodeJS.Timeout;

    records: Record[];

    constructor(updateInterval: number, onUpdate: OnUpdateCallback) {
        this.onUpdate = onUpdate;
        this.records = [];
        this.updateInterval = updateInterval;
    }

    get lastUpdate(): number {
        const lastUpdate = this._lastUpdate;
        if (lastUpdate == undefined) {
            throw new Error('Live store not started.');
        }

        return lastUpdate;
    }

    start(): void {
        this._lastUpdate = Date.now() - this.updateInterval;
        this.update();
    }

    stop(): void {
        clearTimeout(this.updateTimeoutId);
    }

    async update(): Promise<void> {
        clearTimeout(this.updateTimeoutId); // in case update wasn't triggered by timeout.

        this.records = await store.getIncomplete();

        this._lastUpdate = Date.now();
        this.updateTimeoutId = setTimeout(
            this.update.bind(this),
            this.updateInterval
        );

        this.onUpdate();
    }
}

export default LiveStore;
