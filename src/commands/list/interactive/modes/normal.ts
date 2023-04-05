import { LiveStoreView } from '../live-store/index.js';
import Mode, { Key, KeypressResult, Status } from './mode.js';

class NormalMode implements Mode {
    liveStoreView: LiveStoreView;

    constructor(liveStoreView: LiveStoreView) {
        this.liveStoreView = liveStoreView;
    }

    getStatus(): Status | undefined {
        return;
    }

    async keypress(
        data: string,
        key: Key
    ): Promise<KeypressResult | undefined> {
        if (key.ctrl || key.meta || key.shift) {
            return;
        }

        if (data === 'a') {
            return KeypressResult.ADD;
        }

        if (data === '/') {
            return KeypressResult.SEARCH;
        }

        const records = this.liveStoreView.getRecords();
        if (!records.length) {
            return;
        }

        if (key.name === 'up' || key.name === 'down') {
            return KeypressResult.SELECTION;
        }
    }
}

export default NormalMode;
