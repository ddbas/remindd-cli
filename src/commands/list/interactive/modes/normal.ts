import BaseMode from './base.js';
import Mode, { Key, KeypressResult, UpdateResult } from './mode.js';
import SearchMode from './search.js';
import SelectionMode from './selection.js';

class NormalMode implements Mode {
    base: BaseMode;

    constructor(base: BaseMode) {
        this.base = base;
    }

    async keypress(
        data: string,
        key: Key
    ): Promise<KeypressResult | undefined> {
        const result = await this.base.keypress(data, key);
        if (result) {
            return result;
        }

        if (key.ctrl || key.meta || key.shift) {
            return;
        }

        if (key.name === 'up' || key.name === 'down') {
            if (!this.base.records) {
                return;
            }

            return { mode: new SelectionMode(this.base), update: true };
        }

        if (data === '/') {
            return { mode: new SearchMode(this.base), update: true };
        }
    }

    async update(): Promise<UpdateResult | undefined> {
        return await this.base.update();
    }
}

export default NormalMode;
