import crypto from 'node:crypto';
import remind from '@remindd/core';

import getFormatter, { FormattableRecord } from '../format.js';
import Store from '../store.js';

const me = async (text: string): Promise<void> => {
    const reminder = remind(text);

    const store = new Store();
    const data = await store.getData();
    const id = crypto.randomBytes(4).toString('hex');
    const record = {
        id,
        reminder,
    };
    data.records.push(record);
    await store.setData(data);

    const format = getFormatter();
    const formattableRecord = new FormattableRecord(record);
    console.log(format(formattableRecord));
};

export default me;
