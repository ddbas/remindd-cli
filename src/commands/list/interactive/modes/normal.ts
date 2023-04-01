import LiveStore, { BaseLiveStore } from '../live-store.js';
import Mode, { Key, Update } from './mode.js';
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

    async keypress(data: string, key: Key): Promise<Update> {
        if (key.ctrl || key.meta || key.shift) {
            return false;
        }

        if (data === '/') {
            return new SearchMode();
        }

        const records = this.liveStore.getRecords();
        if (!records.length) {
            return false;
        }

        if (key.name === 'up' || key.name === 'down') {
            return new SelectionMode(this.liveStore);
        }

        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async update() {}
}

export default NormalMode;
