import remind from '@remindd/core';

import getFormatter, { FormattableRecord } from '../format.js';
import store from '../store/index.js';

const me = async (text: string): Promise<void> => {
    const reminder = remind(text);
    const record = await store.create(reminder);

    const format = getFormatter();
    const formattableRecord = new FormattableRecord(record);
    console.log(format(formattableRecord));
};

export default me;
