import LiveStore from '../live-store.js';
import { Record } from '../../../../store/index.js';

type Key = {
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
};

type Update = Mode | boolean;

interface Mode {
    liveStore: LiveStore;
    keypress(data: string, key: Key): Promise<Update>;
    update(oldRecords: Record[]): void;
}

export { Key, Update };

export default Mode;
