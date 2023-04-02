import AddMode from './add.js';
import { LiveStoreView } from '../live-store/index.js';
import Mode, { Key, KeypressResult, PUSH, Status } from './mode.js';
import SearchMode from './search.js';
import SelectionMode from './selection.js';

class NormalMode implements Mode {
    liveStoreView: LiveStoreView;

    constructor(liveStoreView: LiveStoreView) {
        this.liveStoreView = liveStoreView;
    }

    getStatus(): Status | undefined {
        return;
    }

    async keypress(data: string, key: Key): Promise<KeypressResult> {
        if (key.ctrl || key.meta || key.shift) {
            return false;
        }

        if (data === 'a') {
            return PUSH(new AddMode(this.liveStoreView));
        }

        if (data === '/') {
            return PUSH(new SearchMode(this.liveStoreView));
        }

        const records = this.liveStoreView.getRecords();
        if (!records.length) {
            return false;
        }

        if (key.name === 'up' || key.name === 'down') {
            return PUSH(new SelectionMode(this.liveStoreView));
        }

        return false;
    }
}

export default NormalMode;
