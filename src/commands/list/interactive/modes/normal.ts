import LiveStore, { BaseLiveStore } from '../live-store.js';
import Mode, { Key, KeypressResult } from './mode.js';
import SearchMode from './search.js';
import SelectionMode from './selection.js';

class NormalMode implements Mode {
    liveStore: LiveStore;

    constructor(liveStore?: LiveStore) {
        if (liveStore) {
            this.liveStore = liveStore;
        } else {
            this.liveStore = new BaseLiveStore();
        }
    }

    async keypress(
        data: string,
        key: Key
    ): Promise<KeypressResult | undefined> {
        if (key.ctrl || key.meta || key.shift) {
            return;
        }

        if (data === '/') {
            return { mode: new SearchMode(), update: true };
        }

        const records = this.liveStore.getRecords();
        if (!records.length) {
            return;
        }

        if (key.name === 'up' || key.name === 'down') {
            return { mode: new SelectionMode(this.liveStore), update: true };
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async update() {}
}

export default NormalMode;
