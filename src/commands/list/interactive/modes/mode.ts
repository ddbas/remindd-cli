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

interface ModePopTransition {
    kind: 'POP';
}

interface ModePushTransition {
    kind: 'PUSH';
    mode: Mode;
}

interface ModeReplaceTransition {
    kind: 'REPLACE';
    mode: Mode;
}

type ModeTransition =
    | ModePopTransition
    | ModePushTransition
    | ModeReplaceTransition;

const POP: ModePopTransition = { kind: 'POP' };
const PUSH = (mode: Mode): ModePushTransition => ({ kind: 'PUSH', mode });
const REPLACE = (mode: Mode): ModeReplaceTransition => ({
    kind: 'REPLACE',
    mode,
});

type Render = boolean;

type KeypressResult = ModeTransition | Render;

interface Mode {
    liveStoreView: LiveStoreView;
    getStatus(): Status | undefined;
    keypress(data: string, key: Key): Promise<KeypressResult>;
}

export { Key, KeypressResult, POP, PUSH, REPLACE, Status, StatusLevel };

export default Mode;
