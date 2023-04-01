import LiveStore from '../live-store.js';
import { Record } from '../../../../store/index.js';

type Key = {
    name: string;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
};

interface PopModeChange {
    kind: 'POP';
}

interface PushModeChange {
    kind: 'PUSH';
    mode: Mode;
}

interface ReplaceModeChange {
    kind: 'REPLACE';
    mode: Mode;
}

type ModeChange = PopModeChange | PushModeChange | ReplaceModeChange;

const POP = (): PopModeChange => ({ kind: 'POP' });
const PUSH = (mode: Mode): PushModeChange => ({ kind: 'PUSH', mode });
const REPLACE = (mode: Mode): ReplaceModeChange => ({ kind: 'REPLACE', mode });

type Update = boolean;

type KeypressResult = ModeChange | Update;

interface Mode {
    liveStore: LiveStore;
    keypress(data: string, key: Key): Promise<KeypressResult>;
    update(oldRecords: Record[]): void;
}

export { Key, KeypressResult, POP, PUSH, REPLACE };

export default Mode;
