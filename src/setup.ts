import fs from 'node:fs/promises';
import path from 'node:path';

import Store from './store.js';

const setup = async (): Promise<void> => {
    const store = new Store();
    const storePath = store.path;
    try {
        await fs.access(storePath, fs.constants.R_OK | fs.constants.W_OK);
        return;
    } catch {
        // Store not created yet.
    }

    const storeDirectory = path.dirname(storePath);
    try {
        await fs.mkdir(storeDirectory, { recursive: true });
    } catch {
        throw new Error('Failed to create the store.');
    }

    try {
        await fs.writeFile(storePath, JSON.stringify({}));
    } catch {
        throw new Error('Failed to create the store.');
    }
};

export default setup;
