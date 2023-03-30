import LiveStore from '../live-store.js';
import Mode, { KeypressResult } from './mode.js';

class RescheduleMode implements Mode {
    liveStore: LiveStore;
    dateText: string;

    constructor(liveStore: LiveStore) {
        this.liveStore = liveStore;
        this.dateText = '';
    }

    async keypress(): Promise<KeypressResult | undefined> {
        return;
    }

    async update() {
        await this.liveStore.update();
    }
}

export default RescheduleMode;
