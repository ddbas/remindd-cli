import { LiveStoreView } from '../live-store/index.js';

enum StatusLevel {
    INFO,
    ERROR,
}

interface Status {
    level: StatusLevel;
    text: string;
}

type Key = {
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
};

enum KeypressResult {
    ADD,
    RESCHEDULE,
    SEARCH,
    SELECTION,

    CANCEL,
    SUBMIT,
    UPDATE,
}

interface Mode {
    liveStoreView: LiveStoreView;
    getStatus(): Status | undefined;
    keypress(data: string, key: Key): Promise<KeypressResult | undefined>;
}

export { Key, KeypressResult, Status, StatusLevel };

export default Mode;
