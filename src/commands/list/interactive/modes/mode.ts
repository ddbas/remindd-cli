import LiveStore from '../live-store.js';
import { Record } from '../../../../store/index.js';

type Key = {
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
};

type KeypressResult = {
    mode?: Mode;
    update: boolean;
};

interface Mode {
    liveStore: LiveStore;
    keypress: (data: string, key: Key) => Promise<KeypressResult | undefined>;
    update: (oldRecords: Record[]) => Promise<void>;
}

export { Key, KeypressResult };

export default Mode;
