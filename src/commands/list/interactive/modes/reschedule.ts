import BaseMode from './base.js';
import Mode, { Key, KeypressResult, UpdateResult } from './mode.js';

class RescheduleMode implements Mode {
    base: BaseMode;
    dateText: string;

    constructor(base: BaseMode) {
        this.base = base;
        this.dateText = '';
    }

    async keypress(
        data: string,
        key: Key
    ): Promise<KeypressResult | undefined> {
        const result = await this.base.keypress(data, key);
        if (result) {
            return result;
        }

        return;
    }

    async update(): Promise<UpdateResult | undefined> {
        return await this.base.update();
    }
}

export default RescheduleMode;
