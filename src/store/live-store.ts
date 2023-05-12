import { Reminder } from '@remindd/core';
import Record from './record.js';
import store, { Store } from './store.js';

export interface LiveStore extends Store {
    lastUpdate: number;
    records: Record[];
    start(): void;
    stop(): void;
}

export class BaseLiveStore implements LiveStore {
    private _lastUpdate: number | undefined;
    private onUpdate: () => void;
    private updateInterval: number;
    private updateTimeoutId?: NodeJS.Timeout;

    records: Record[];

    constructor(updateInterval: number, onUpdate: () => void) {
        this.onUpdate = onUpdate;
        this.records = [];
        this.updateInterval = updateInterval;
    }

    async complete(record: Record): Promise<void> {
        await store.complete(record);
        await this.updateStore();
    }

    async create(reminder: Reminder): Promise<Record> {
        const record = await store.create(reminder);
        await this.updateStore();
        return record;
    }

    getCompleted(): Promise<Record[]> {
        return store.getCompleted();
    }

    getIncomplete(): Promise<Record[]> {
        return store.getIncomplete();
    }

    async remove(record: Record): Promise<void> {
        await store.remove(record);
        await this.updateStore();
    }

    async update(record: Record): Promise<void> {
        await store.update(record);
        await this.updateStore();
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
        this.updateStore();
    }

    stop(): void {
        clearTimeout(this.updateTimeoutId);
    }

    private async updateStore(): Promise<void> {
        clearTimeout(this.updateTimeoutId); // in case update wasn't triggered by timeout.

        this.records = await store.getIncomplete();

        this._lastUpdate = Date.now();
        this.updateTimeoutId = setTimeout(
            this.updateStore.bind(this),
            this.updateInterval
        );

        this.onUpdate();
    }
}
