import remind from '@remindd/core';

import { getRecordFormatter } from '../../../../format.js';
import { LiveStoreView } from '../live-store/index.js';
import Mode, { Key, KeypressResult, Status, StatusLevel } from './mode.js';
import store, { Record } from '../../../../store/index.js';

class RescheduleMode implements Mode {
    dateText: string;
    private format: (r: Record) => string;
    liveStoreView: LiveStoreView;
    status?: Status;

    constructor(liveStoreView: LiveStoreView, record: Record) {
        this.dateText = '';
        this.liveStoreView = new SingleRecordLiveStoreView(
            liveStoreView,
            record
        );
        this.format = getRecordFormatter('%t');
    }

    getStatus(): Status | undefined {
        const records = this.liveStoreView.getRecords();
        if (!records.length) {
            return {
                level: StatusLevel.ERROR,
                text: 'No record to reschedule.',
            };
        }

        const [record] = records;
        return {
            level: StatusLevel.INFO,
            text: `Reschedule '${this.format(record).trimEnd()}'`,
        };
    }

    async keypress(
        data: string,
        key: Key
    ): Promise<KeypressResult | undefined> {
        const records = this.liveStoreView.getRecords();
        if (!records.length) {
            return;
        }

        if (key.name === 'backspace') {
            this.dateText = this.dateText.slice(0, -1);
            return KeypressResult.UPDATE;
        }

        if (key.name === 'return' || key.name === 'enter') {
            const { date } = remind(this.dateText);
            const [record] = records;
            record.reminder.date = date;
            await store.update(record);
            return KeypressResult.SUBMIT;
        }

        this.dateText += data;

        return KeypressResult.UPDATE;
    }
}

class SingleRecordLiveStoreView implements LiveStoreView {
    private recordId: string;
    private liveStoreView: LiveStoreView;

    constructor(liveStoreView: LiveStoreView, record: Record) {
        this.liveStoreView = liveStoreView;
        this.recordId = record.id;
    }

    getLastUpdate(): number {
        return this.liveStoreView.getLastUpdate();
    }

    getRecords(): Record[] {
        const records = this.liveStoreView.getRecords() || [];
        const record = records.find((record) => record.id === this.recordId);
        if (!record) {
            return [];
        }

        return [record];
    }
}
export default RescheduleMode;
