import BaseMode from './base';

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

type UpdateResult = Mode;

interface Mode {
    base: BaseMode;
    keypress: (data: string, key: Key) => Promise<KeypressResult | undefined>;
    update: () => Promise<UpdateResult | undefined>;
}

export { Key, KeypressResult, UpdateResult };

export default Mode;
