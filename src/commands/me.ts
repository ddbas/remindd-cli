import remind from '@remindd/core';

import { getRecordFormatter } from '../format.js';
import store from '../store/index.js';

const me = async (text: string): Promise<void> => {
    const reminder = remind(text);
    const record = await store.create(reminder);

    const format = getRecordFormatter();
    console.log(format(record));
};

export default me;
