import LiveStore, { BaseLiveStore } from '../live-store.js';
import AddMode from './add.js';
import Mode, { Key, KeypressResult, PUSH } from './mode.js';
import SearchMode from './search.js';
import SelectionMode from './selection.js';

class NormalMode implements Mode {
    liveStore: LiveStore;

    constructor() {
        this.liveStore = new BaseLiveStore();
    }

    async keypress(data: string, key: Key): Promise<KeypressResult> {
        if (key.ctrl || key.meta || key.shift) {
            return false;
        }

        if (data === 'a') {
            return PUSH(new AddMode());
        }

        if (data === '/') {
            return PUSH(new SearchMode());
        }

        const records = this.liveStore.getRecords();
        if (!records.length) {
            return false;
        }

        if (key.name === 'up' || key.name === 'down') {
            return PUSH(new SelectionMode(this.liveStore));
        }

        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async update() {}
}

export default NormalMode;
